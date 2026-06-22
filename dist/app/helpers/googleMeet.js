"use strict";
// import { SpacesServiceClient } from "@google-apps/meet";
// import oauth2Client from "../config/googleAuth";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleMeetLink = void 0;
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
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const teacher_model_1 = require("../modules/teacher/teacher.model");
const AppError_1 = __importDefault(require("./AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createGoogleMeetLink = (studentEmail, teacherEmail, startDateTime, endDateTime, teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId);
    if (!(teacher === null || teacher === void 0 ? void 0 : teacher.googleRefreshToken)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Teacher has not connected Google account. Please ask the teacher to connect their Google account.");
    }
    // Use teacher's OAuth tokens
    const teacherAuth = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    teacherAuth.setCredentials({
        access_token: teacher.googleAccessToken,
        refresh_token: teacher.googleRefreshToken,
        expiry_date: teacher.googleTokenExpiry,
    });
    // Auto-save rotated tokens
    teacherAuth.on("tokens", (tokens) => __awaiter(void 0, void 0, void 0, function* () {
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, Object.assign(Object.assign({ googleAccessToken: tokens.access_token }, (tokens.refresh_token && { googleRefreshToken: tokens.refresh_token })), { googleTokenExpiry: tokens.expiry_date }));
    }));
    const calendar = googleapis_1.google.calendar({ version: "v3", auth: teacherAuth });
    // const startDateTime = new Date(`${date}T${startTime}:00.000Z`);
    // const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    if (isNaN(startDateTime.getTime()) ||
        isNaN(endDateTime.getTime())) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid startTime or endTime");
    }
    const event = yield calendar.events.insert({
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
    const meetLink = (_c = (_b = (_a = event.data.conferenceData) === null || _a === void 0 ? void 0 : _a.entryPoints) === null || _b === void 0 ? void 0 : _b.find((e) => e.entryPointType === "video")) === null || _c === void 0 ? void 0 : _c.uri;
    if (!meetLink) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Failed to generate Google Meet link");
    }
    return meetLink;
});
exports.createGoogleMeetLink = createGoogleMeetLink;
