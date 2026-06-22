// import { SpacesServiceClient } from "@google-apps/meet";
// import oauth2Client from "../config/googleAuth";

// export const createGoogleMeetLink = async (): Promise<string> => {
//   const meetClient = new SpacesServiceClient({
//     authClient: oauth2Client as any,
//   });

//   const [space] = await meetClient.createSpace({});

//   if (!space.meetingUri) {
//     throw new Error("Failed to create Google Meet link");
//   }

//   return space.meetingUri;
// };

// import { google } from "googleapis";
// import oauth2Client from "../config/googleAuth";

// export const createGoogleMeetLink = async (
//   studentEmail: string,
//   teacherEmail: string,
//   date: string, // format: "2024-03-20"
//   startTime: string, // format: "14:00"
// ): Promise<string> => {
//   const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//   const startDateTime = new Date(`${date}T${startTime}:00.000Z`);
//   const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

//   const event = await calendar.events.insert({
//     calendarId: "primary",
//     conferenceDataVersion: 1, // required to generate Meet link
//     requestBody: {
//       summary: "Tutor Class",
//       start: {
//         dateTime: startDateTime.toISOString(),
//         timeZone: "UTC",
//       },
//       end: {
//         dateTime: endDateTime.toISOString(),
//         timeZone: "UTC",
//       },
//       // Both student and teacher are invited
//       attendees: [{ email: studentEmail }, { email: teacherEmail }],
//       conferenceData: {
//         createRequest: {
//           requestId: `meet-${Date.now()}`, // must be unique
//           conferenceSolutionKey: {
//             type: "hangoutsMeet",
//           },
//         },
//       },
//       // Both can join without knocking
//       guestsCanModify: false,
//       guestsCanInviteOthers: false,
//     },
//   });

//   const meetLink = event.data.conferenceData?.entryPoints?.find(
//     (e) => e.entryPointType === "video",
//   )?.uri;

//   if (!meetLink) {
//     throw new Error("Failed to generate Google Meet link");
//   }

//   return meetLink;
// };

import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { TeacherModel } from "../modules/teacher/teacher.model";
import AppError from "./AppError";
import httpStatus from "http-status-codes";

export const createGoogleMeetLink = async (
  studentEmail: string,
  teacherEmail: string,
  startDateTime: Date,
  endDateTime: Date,
  teacherId: string,
): Promise<{ meetLink: string; eventId: string }> => {
  const teacher = await TeacherModel.findById(teacherId);

  if (!teacher?.googleRefreshToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Teacher has not connected Google account. Please ask the teacher to connect their Google account.",
    );
  }

  // Use teacher's OAuth tokens
  const teacherAuth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  teacherAuth.setCredentials({
    access_token: teacher.googleAccessToken,
    refresh_token: teacher.googleRefreshToken,
    expiry_date: teacher.googleTokenExpiry,
  });

  // Auto-save rotated tokens
  teacherAuth.on("tokens", async (tokens) => {
    await TeacherModel.findByIdAndUpdate(teacherId, {
      googleAccessToken: tokens.access_token,
      ...(tokens.refresh_token && { googleRefreshToken: tokens.refresh_token }),
      googleTokenExpiry: tokens.expiry_date,
    });
  });

  const calendar = google.calendar({ version: "v3", auth: teacherAuth });

  // const startDateTime = new Date(`${date}T${startTime}:00.000Z`);
  // const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);


  if (
    isNaN(startDateTime.getTime()) ||
    isNaN(endDateTime.getTime())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid startTime or endTime",
    );
  }



  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: "Tutor Class",
      start: { dateTime: startDateTime.toISOString(), timeZone: "UTC" },
      end: { dateTime: endDateTime.toISOString(), timeZone: "UTC" },
      attendees: [{ email: studentEmail }, { email: teacherEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
    },
  });

  const meetLink = event.data.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video",
  )?.uri;

  if (!meetLink) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Failed to generate Google Meet link",
    );
  }

  const eventId = event.data.id!;

  return { meetLink, eventId };
};

export const deleteGoogleCalendarEvent = async (
  teacherId: string,
  eventId: string,
): Promise<void> => {
  const teacher = await TeacherModel.findById(teacherId);

  if (!teacher?.googleRefreshToken) return;

  const teacherAuth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  teacherAuth.setCredentials({
    access_token: teacher.googleAccessToken,
    refresh_token: teacher.googleRefreshToken,
    expiry_date: teacher.googleTokenExpiry,
  });

  teacherAuth.on("tokens", async (tokens) => {
    await TeacherModel.findByIdAndUpdate(teacherId, {
      googleAccessToken: tokens.access_token,
      ...(tokens.refresh_token && { googleRefreshToken: tokens.refresh_token }),
      googleTokenExpiry: tokens.expiry_date,
    });
  });

  const calendar = google.calendar({ version: "v3", auth: teacherAuth });

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
    sendUpdates: "all",
  });
};
