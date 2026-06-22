import mongoose from "mongoose";
import { BookingModel } from "./booking.model";
import { StudentModel } from "../student/student.model";
import { UserModel } from "../user/user.model";
import { TeacherModel } from "../teacher/teacher.model";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";
import { createGoogleMeetLink, deleteGoogleCalendarEvent } from "../../helpers/googleMeet";
import { localToUtc } from "../../utils/timezone";
import { DateTime } from "luxon";
import { sendEmail } from "../../utils/sendEmail";
import { envVars } from "../../config";
import { AvailabilityModel } from "../availability/availability.model";
import { generateToken, verifyToken } from "../../utils/jwt";

const computeStatus = (
  startTime: Date,
  storedStatus: string,
): "scheduled" | "completed" | "cancelled" => {
  if (storedStatus === "cancelled") return "cancelled";
  if (storedStatus === "cancelledByStudent") return "cancelled";
  const classEnd = new Date(new Date(startTime).getTime() + 60 * 60 * 1000);
  return classEnd <= new Date() ? "completed" : "scheduled";
};

const isValidTimezone = (tz: string): boolean => {
  if (!tz) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const formatDateEmail = (startTime: Date, timezone: string): string => {
  const resolvedTz = isValidTimezone(timezone) ? timezone : "UTC";
  return new Date(startTime).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: resolvedTz,
  });
};

const formatTimeEmail = (startTime: Date, timezone: string): string => {
  const resolvedTz = isValidTimezone(timezone) ? timezone : "UTC";
  return new Date(startTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: resolvedTz,
  });
};

export const buildJoinUrl = (bookingId: string, role: "teacher" | "student"): string => {
  const token = generateToken({ bookingId, role }, envVars.JWT_ACCESS_SECRET, "30d");
  return `${envVars.BACKEND_URL}/api/v1/booking/join/${bookingId}?token=${token}`;
};

const createBooking = async (userId: string, payload: any) => {

  const { teacherId: payloadTeacherId, teacher, startTime, endTime } =
    payload;


  console.log("== create booking payload =>>>> ", payload);


  const teacherId = payloadTeacherId || teacher;

  // resolve these before the transaction (read-only, no side effects)
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

    // UTC ISO time received from frontend
  const startUtcDate = new Date(startTime);
  const endUtcDate = new Date(endTime);

  if (isNaN(startUtcDate.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid start time");
  }

  // const studentTz = timezone || user.timezone || "UTC";
  // const utcStart = localToUtc(startTime, date, studentTz);
  // const startUtcDate = new Date(
  //   `${utcStart.utcDate}T${utcStart.utcTime}:00.000Z`,
  // );

  const teacherUser = await UserModel.findOne({ teacher: teacherId }).select(
    "email name timezone",
  );
  const studentUser = await UserModel.findOne({ student: user.student }).select(
    "email name timezone",
  );
  if (!teacherUser || !studentUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Early credit check — avoids wasting a Google Meet API call for insufficient credits
  const studentForCreditCheck = await StudentModel.findById(user.student).select("credits");
  const currentCredits = studentForCreditCheck?.credits ?? 0;
  if (currentCredits < 1) {
    throw new AppError(
      httpStatus.PAYMENT_REQUIRED,
      `You don't have enough credits to book a class. Your current balance is ${currentCredits} credit${currentCredits === 1 ? "" : "s"}. Please purchase a package to continue.`,
    );
  }

  // external API call outside transaction — no DB rollback needed if this fails
  const { meetLink, eventId: calendarEventId } = await createGoogleMeetLink(
    studentUser.email,
    teacherUser.email,
    startUtcDate,
    endUtcDate,
    teacherId,
  );

  const session = await mongoose.startSession();
  let bookingId: any;

  try {
    await session.withTransaction(async () => {
      const student = await StudentModel.findById(user.student).session(session);
      if (!student) throw new AppError(httpStatus.NOT_FOUND, "Student not found");

      const credits = student.credits ?? 0;
      if (credits < 1) {
        throw new AppError(
          httpStatus.PAYMENT_REQUIRED,
          `You don't have enough credits to book a class. Your current balance is ${credits} credit${credits === 1 ? "" : "s"}. Please purchase a package to continue.`,
        );
      }

      const availability = await AvailabilityModel.findOne({
        teacherId,
        slots: { $elemMatch: { startTime: startUtcDate, isBooked: false } },
      }).session(session);

      if (!availability) {
        throw new AppError(
          httpStatus.CONFLICT,
          "Slot not available or already booked",
        );
      }

      const slotIndex = (availability.slots as any[]).findIndex(
        (s) =>
          new Date(s.startTime).getTime() === startUtcDate.getTime() &&
          s.isBooked === false,
      );

      if (slotIndex === -1) {
        throw new AppError(httpStatus.CONFLICT, "Slot already booked");
      }

      availability.slots[slotIndex].isBooked = true;
      await availability.save({ session });

      student.credits = (student.credits ?? 0) - 1;
      await student.save({ session });

      const [booking] = await BookingModel.create(
        [{ studentId: student._id, teacherId, startTime: startUtcDate, endTime: endUtcDate, meetLink, calendarEventId, status: "scheduled" }],
        { session },
      );

      await StudentModel.findByIdAndUpdate(
        student._id,
        { $push: { booking: booking._id } },
        { session },
      );

      await TeacherModel.findByIdAndUpdate(
        teacherId,
        { $push: { bookings: booking._id } },
        { session },
      );

      bookingId = booking._id;
    });
  } finally {
    session.endSession();
  }

  const teacherTz = teacherUser.timezone || "UTC";
  const studentTz2 = studentUser.timezone || "UTC";

  console.log({teacherTz, studentTz2})


  const bookingIdStr = bookingId.toString();
  Promise.allSettled([
    sendEmail({
      to: teacherUser.email,
      subject: "New Class Booking Confirmed",
      templateName: "bookingConfirmation",
      templateData: {
        recipientName: teacherUser.name || "Teacher",
        teacherName: teacherUser.name || "Teacher",
        studentName: studentUser.name || "Student",
        studentEmail: studentUser.email,
        formattedDate: formatDateEmail(startUtcDate, teacherTz),
        formattedTime: formatTimeEmail(startUtcDate, teacherTz),
        meetLink: buildJoinUrl(bookingIdStr, "teacher"),
      },
    }),
    sendEmail({
      to: studentUser.email,
      subject: "Class Booking Confirmed",
      templateName: "bookingConfirmation",
      templateData: {
        recipientName: studentUser.name || "Student",
        teacherName: teacherUser.name || "Teacher",
        studentName: studentUser.name || "Student",
        studentEmail: studentUser.email,
        formattedDate: formatDateEmail(startUtcDate, studentTz2),
        formattedTime: formatTimeEmail(startUtcDate, studentTz2),
        meetLink: buildJoinUrl(bookingIdStr, "student"),
      },
    }),
  ]).catch((err) => console.error("Failed to send confirmation emails:", err));

  return await BookingModel.findById(bookingId)
    .populate("studentId", "name email")
    .populate("teacherId", "name email");
};

const getMyBookings = async (userId: string, viewerTimezone?: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const tz = viewerTimezone || user.timezone || "UTC";
  let bookings;

  if (user.student) {
    bookings = await BookingModel.find({ studentId: user.student })
      .populate("teacherId", "name email nationality experience")
      .sort({ startTime: 1 });
  } else if (user.teacher) {
    bookings = await BookingModel.find({ teacherId: user.teacher })
      .populate("studentId", "name email")
      .sort({ startTime: 1 });
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User has no student or teacher profile",
    );
  }

  return bookings.map((b) => {
    const obj = b.toObject();
    const dt = DateTime.fromJSDate(new Date(obj.startTime)).setZone(tz);
    return {
      ...obj,
      date: dt.toFormat("yyyy-MM-dd"),
      day: dt.toFormat("cccc"),
      startTime: obj.startTime,
      status: computeStatus(new Date(obj.startTime), obj.status),
    };
  });
};

const cancelBooking = async (
  userId: string,
  bookingId: string,
  reason: string,
) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  const isStudent =
    user.student && booking.studentId.toString() === user.student.toString();
  const isTeacher =
    user.teacher && booking.teacherId.toString() === user.teacher.toString();

  if (!isStudent && !isTeacher) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to cancel this booking",
    );
  }

  if (
    booking.status === "cancelled" ||
    booking.status === "cancelledByStudent"
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Booking is already cancelled");
  }

  const now = new Date();
  const classDateTime = new Date(booking.startTime);

  if (classDateTime <= now) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel a class that has already passed",
    );
  }

  const hoursUntilClass =
    (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isWithin24Hours = hoursUntilClass <= 24;

  let responseMessage = "";

  if (isTeacher) {
    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = "teacher";
    await booking.save();

    await StudentModel.findByIdAndUpdate(booking.studentId, {
      $inc: { credits: 1 },
    });

    await TeacherModel.findByIdAndUpdate(booking.teacherId, {
      $inc: { totalCanceledClasses: 1 },
    });

    responseMessage = isWithin24Hours
      ? "Booking cancelled by teacher within 24 hours. Student credit has been refunded."
      : "Booking cancelled. Student credit has been refunded.";
  } else {
    if (isWithin24Hours) {
      booking.status = "cancelledByStudent";
      booking.cancellationReason = reason;
      booking.cancelledBy = "student";
      await booking.save();

      await TeacherModel.findByIdAndUpdate(booking.teacherId, {
        $inc: {
          totalEarnings: 10,
          unpaidEarnings: 10,
          totalCanceledClasses: 1,
        },
      });

      responseMessage =
        "Booking cancelled within 24 hours. No credit refund — teacher has been paid.";
    } else {
      booking.status = "cancelled";
      booking.cancellationReason = reason;
      booking.cancelledBy = "student";
      await booking.save();

      await StudentModel.findByIdAndUpdate(booking.studentId, {
        $inc: { credits: 1 },
      });

      await TeacherModel.findByIdAndUpdate(booking.teacherId, {
        $inc: { totalCanceledClasses: 1 },
      });

      responseMessage =
        "Booking cancelled. 1 credit has been refunded to your account.";
    }
  }

  const teacherUser = await UserModel.findOne({
    teacher: booking.teacherId,
  }).select("email name timezone");

  const studentUser = await UserModel.findOne({
    student: booking.studentId,
  }).select("email name timezone");

  const adminUser = await UserModel.findOne({
    email: envVars.ADMIN_EMAIL,
  }).select("email name timezone");

  await AvailabilityModel.updateOne(
    {
      teacherId: booking.teacherId,
      "slots.startTime": new Date(booking.startTime),
    },
    { $set: { "slots.$.isBooked": false } },
  );

  const cancelledBy = isTeacher ? "teacher" : "student";
  const refunded = isTeacher || !isWithin24Hours;
  const teacherTz = teacherUser?.timezone || "UTC";
  const studentTz = studentUser?.timezone || "UTC";

  const sharedData = {
    teacherName: teacherUser?.name || "Teacher",
    studentName: studentUser?.name || "Student",
    cancelledBy,
    reason,
    refunded,
  };

  type Recipient = { email: string; recipientName: string; tz: string };
  const recipients: Recipient[] = [];

  if (teacherUser?.email)
    recipients.push({ email: teacherUser.email, recipientName: teacherUser.name || "Teacher", tz: teacherTz });
  if (studentUser?.email)
    recipients.push({ email: studentUser.email, recipientName: studentUser.name || "Student", tz: studentTz });
  if (adminUser?.email)
    recipients.push({ email: adminUser.email, recipientName: adminUser.name || "Admin", tz: adminUser?.timezone || "UTC" });

  await Promise.allSettled(
    recipients.map(({ email, recipientName, tz }) =>
      sendEmail({
        to: email,
        subject: "Class Cancellation Notice",
        templateName: "cancellationNotification",
        templateData: {
          ...sharedData,
          formattedDate: formatDateEmail(new Date(booking.startTime), tz),
          formattedTime: formatTimeEmail(new Date(booking.startTime), tz),
          recipientName,
        },
      }),
    ),
  );

  return { refunded, cancelledBy, message: responseMessage };
};

const TEACHER_RATE = 10;

const markTeacherJoined = async (userId: string, bookingId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.FORBIDDEN, "Only teachers can call this");
  }

  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.teacherId.toString() !== user.teacher.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your booking");
  }

  if (booking.status === "cancelled" || booking.status === "cancelledByStudent") {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot join a cancelled booking");
  }

  const now = new Date();

  if (!booking.teacherJoined) {
    booking.teacherJoined = true;
    booking.teacherFirstJoinedAt = now;
    const windowStart = new Date(new Date(booking.startTime).getTime() - 15 * 60 * 1000);
    if (booking.status === "scheduled" && now >= windowStart && now <= new Date(booking.endTime)) {
      await TeacherModel.findByIdAndUpdate(user.teacher, {
        $inc: {
          totalClasses: 1,
          totalEarnings: TEACHER_RATE,
          unpaidEarnings: TEACHER_RATE,
        },
      });
    }
  }

  booking.teacherLastJoinedAt = now;
  await booking.save();

  return { success: true };
};

const markStudentJoined = async (userId: string, bookingId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.FORBIDDEN, "Only students can call this");
  }

  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.studentId.toString() !== user.student.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your booking");
  }

  if (booking.status === "cancelled" || booking.status === "cancelledByStudent") {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot join a cancelled booking");
  }

  const now = new Date();

  if (!booking.studentJoined) {
    booking.studentJoined = true;
    booking.studentFirstJoinedAt = now;
    const windowStart = new Date(new Date(booking.startTime).getTime() - 15 * 60 * 1000);
    if (booking.status === "scheduled" && now >= windowStart && now <= new Date(booking.endTime)) {
      await StudentModel.findByIdAndUpdate(user.student, {
        $inc: { totalCompletedClasses: 1 },
      });
    }
  }

  booking.studentLastJoinedAt = now;
  await booking.save();

  return { success: true };
};

const joinViaLink = async (bookingId: string, token: string): Promise<string> => {
  let payload: any;
  try {
    payload = verifyToken(token, envVars.JWT_ACCESS_SECRET);
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired join link");
  }

  if (payload.bookingId !== bookingId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Token does not match this booking");
  }

  const booking = await BookingModel.findById(bookingId);

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.status === "cancelled" || booking.status === "cancelledByStudent") {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot join a cancelled booking");
  }

  const role = payload.role as "teacher" | "student";
  const now = new Date();

  const windowStart = new Date(new Date(booking.startTime).getTime() - 15 * 60 * 1000);
  const withinWindow = booking.status === "scheduled" && now >= windowStart && now <= new Date(booking.endTime);

  if (role === "teacher") {
    if (!booking.teacherJoined) {
      booking.teacherJoined = true;
      booking.teacherFirstJoinedAt = now;
      if (withinWindow) {
        await TeacherModel.findByIdAndUpdate(booking.teacherId, {
          $inc: { totalClasses: 1, totalEarnings: TEACHER_RATE, unpaidEarnings: TEACHER_RATE },
        });
      }
    }
    booking.teacherLastJoinedAt = now;
  } else if (role === "student") {
    if (!booking.studentJoined) {
      booking.studentJoined = true;
      booking.studentFirstJoinedAt = now;
      if (withinWindow) {
        await StudentModel.findByIdAndUpdate(booking.studentId, {
          $inc: { totalCompletedClasses: 1 },
        });
      }
    }
    booking.studentLastJoinedAt = now;
  }

  await booking.save();
  return booking.meetLink as string;
};

// const getAllBookings = async () => {
//   const bookings = await BookingModel.find()
//     .populate("studentId", "name email")
//     .populate("teacherId", "name email")
//     .sort({ createdAt: -1 });
//   return bookings;
// };


const getAllBookings = async () => {
  const bookings = await BookingModel.find()
    .populate({
      path: "studentId",
      select: "name email booking",
      populate: {
        path: "booking",
      },
    })
    .populate("teacherId", "name email")
    .sort({ createdAt: -1 });
  return bookings;
};
export const BookingService = {
  createBooking,
  getMyBookings,
  cancelBooking,
  markTeacherJoined,
  markStudentJoined,
  joinViaLink,
  getAllBookings,
};
