"use strict";
// import cron from "node-cron";
// import { BookingModel } from "../modules/booking/booking.model";
// import { sendEmail } from "../utils/sendEmail";
// import { envVars } from "../config";
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
exports.startReminderCron = void 0;
// /**
//  * Parse booking date + time as UTC (works for any timezone)
//  */
// const getClassDateTime = (date: string, time: string) => {
//   return new Date(`${date}T${time}:00.000Z`);
// };
// /**
//  * Send Reminder Emails
//  */
// const sendReminderEmails = async (timeLabel: "24h" | "2h") => {
//   try {
//     const bookings = await BookingModel.find({ status: "scheduled" })
//       .populate("studentId")
//       .populate("teacherId");
//     console.log(`📊 Total scheduled bookings: ${bookings.length}`);
//     if (!bookings.length) return;
//     for (const booking of bookings) {
//       const classDateTime = getClassDateTime(booking.date, booking.startTime);
//       const now = new Date();
//       const diffMs = classDateTime.getTime() - now.getTime();
//       const diffHours = diffMs / (1000 * 60 * 60);
//       console.log(
//         `⏱ Booking ${booking._id} → diffHours: ${diffHours.toFixed(2)}`,
//       );
//       const student: any = booking.studentId;
//       const teacher: any = booking.teacherId;
//       if (!student || !teacher) {
//         console.log("❌ Missing student or teacher after populate");
//         continue;
//       }
//       // 🛑 Prevent duplicate emails
//       if (timeLabel === "24h" && booking.reminder24hSent) continue;
//       if (timeLabel === "2h" && booking.reminder2hSent) continue;
//       // 🎯 PRODUCTION: strict time windows
//       // 24h reminder: send when class is between 23h and 25h away
//       if (timeLabel === "24h" && (diffHours < 23 || diffHours > 25)) continue;
//       // 2h reminder: send when class is between 0.5h and 1.5h away
//       if (timeLabel === "2h" && (diffHours < 1.5 || diffHours > 2.5)) continue;
//       const emailData = {
//         date: booking.date,
//         startTime: booking.startTime,
//         teacherName: teacher.name,
//         studentName: student.name,
//         meetLink: booking.meetLink,
//         timeLabel: timeLabel === "24h" ? "24 Hours Before" : "2 Hour Before",
//       };
//       console.log(`📧 Sending ${timeLabel} reminder emails...`);
//       await Promise.all([
//         sendEmail({
//           to: student.email,
//           subject: `Class Reminder - ${timeLabel === "24h" ? "24 Hours" : "2 Hour"} to go`,
//           templateName: "reminder",
//           templateData: { ...emailData, recipientName: student.name },
//         }),
//         sendEmail({
//           to: teacher.email,
//           subject: `Class Reminder - ${timeLabel === "24h" ? "24 Hours" : "2 Hour"} to go`,
//           templateName: "reminder",
//           templateData: { ...emailData, recipientName: teacher.name },
//         }),
//       ]);
//       // ✅ Mark as sent
//       if (timeLabel === "24h") {
//         booking.reminder24hSent = true;
//       } else {
//         booking.reminder2hSent = true;
//       }
//       await booking.save();
//       console.log(`✅ ${timeLabel} reminder sent for booking ${booking._id}`);
//     }
//   } catch (error) {
//     console.error("❌ Error in sendReminderEmails:", error);
//   }
// };
// /**
//  * Send Review Request Emails
//  */
// const sendReviewRequestEmails = async () => {
//   try {
//     const now = new Date();
//     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
//     const completedBookings = await BookingModel.find({
//       status: "completed",
//       updatedAt: { $gte: oneHourAgo, $lte: now },
//       reviewRequestSent: { $ne: true },
//     }).populate("studentId teacherId");
//     console.log(`📊 Completed bookings to review: ${completedBookings.length}`);
//     if (!completedBookings.length) return;
//     for (const booking of completedBookings) {
//       const student: any = booking.studentId;
//       const teacher: any = booking.teacherId;
//       if (!student || !teacher) {
//         console.log("❌ Missing student/teacher in review");
//         continue;
//       }
//       const reviewLink = `${envVars.FRONTEND_URL}/dashboard/student/booking`;
//       console.log("📧 Sending review email to:", student.email);
//       await sendEmail({
//         to: student.email,
//         subject: `Leave a Review for ${teacher.name}`,
//         templateName: "reviewRequest",
//         templateData: {
//           studentName: student.name,
//           teacherName: teacher.name,
//           date: booking.date,
//           startTime: booking.startTime,
//           reviewLink,
//         },
//       });
//       booking.reviewRequestSent = true;
//       await booking.save();
//       console.log(`✅ Review request sent for booking ${booking._id}`);
//     }
//   } catch (error) {
//     console.error("❌ Error in sendReviewRequestEmails:", error);
//   }
// };
// /**
//  * Start Cron Jobs
//  * Runs every 30 minutes to catch reminders accurately
//  */
// export const startReminderCron = () => {
//   cron.schedule(
//     "0,30 * * * *",
//     async () => {
//       console.log("⏰ Running 24h reminder cron...");
//       await sendReminderEmails("24h");
//     },
//     { timezone: "UTC" },
//   );
//   cron.schedule(
//     "10,40 * * * *",
//     async () => {
//       console.log("⏰ Running 2h reminder cron...");
//       await sendReminderEmails("2h");
//     },
//     { timezone: "UTC" },
//   );
//   cron.schedule(
//     "20,50 * * * *",
//     async () => {
//       console.log("⭐ Running review cron...");
//       await sendReviewRequestEmails();
//     },
//     { timezone: "UTC" },
//   );
//   console.log("✅ Reminder cron scheduled");
// };
// import cron from "node-cron";
// import { BookingModel } from "../modules/booking/booking.model";
// import { UserModel } from "../modules/user/user.model";
// import { sendEmail } from "../utils/sendEmail";
// import { envVars } from "../config";
// /**
//  * Parse booking date + time as UTC
//  */
// const getClassDateTime = (date: string, time: string) => {
//   return new Date(`${date}T${time}:00.000Z`);
// };
// /**
//  * Format "2026-05-10" → "May 10, 2026"
//  */
// const formatDate = (dateStr: string): string => {
//   const [year, month, day] = dateStr.split("-").map(Number);
//   return new Date(year, month - 1, day).toLocaleDateString("en-US", {
//     month: "long",
//     day: "numeric",
//     year: "numeric",
//   });
// };
// /**
//  * Format "09:00" → "9:00 AM"
//  */
// const formatTime = (timeStr: string): string => {
//   const [hour, minute] = timeStr.split(":").map(Number);
//   const ampm = hour >= 12 ? "PM" : "AM";
//   const h12 = hour % 12 || 12;
//   return `${h12}:${minute.toString().padStart(2, "0")} ${ampm}`;
// };
// /**
//  * Send Reminder Emails
//  */
// const sendReminderEmails = async (timeLabel: "24h" | "2h") => {
//   try {
//     const bookings = await BookingModel.find({ status: "scheduled" })
//       .populate("studentId", "name")
//       .populate("teacherId", "name");
//     console.log(`📊 Total scheduled bookings: ${bookings.length}`);
//     if (!bookings.length) return;
//     for (const booking of bookings) {
//       const classDateTime = getClassDateTime(booking.date, booking.startTime);
//       const now = new Date();
//       const diffMs = classDateTime.getTime() - now.getTime();
//       const diffHours = diffMs / (1000 * 60 * 60);
//       console.log(
//         `⏱ Booking ${booking._id} → diffHours: ${diffHours.toFixed(2)}`,
//       );
//       const student: any = booking.studentId;
//       const teacher: any = booking.teacherId;
//       if (!student || !teacher) {
//         console.log("❌ Missing student or teacher after populate");
//         continue;
//       }
//       // Prevent duplicate emails
//       if (timeLabel === "24h" && booking.reminder24hSent) continue;
//       if (timeLabel === "2h" && booking.reminder2hSent) continue;
//       // 24h reminder: send when class is between 23h and 25h away
//       if (timeLabel === "24h" && (diffHours < 23 || diffHours > 25)) continue;
//       // 2h reminder: send when class is between 1.5h and 2.5h away
//       if (timeLabel === "2h" && (diffHours < 1.5 || diffHours > 2.5)) continue;
//       // Look up emails from UserModel — Student/Teacher docs don't carry email
//       const studentUser = await UserModel.findOne({ student: student._id }).select("email");
//       const teacherUser = await UserModel.findOne({ teacher: teacher._id }).select("email");
//       if (!studentUser || !teacherUser) {
//         console.log(`❌ Could not find user accounts for booking ${booking._id}`);
//         continue;
//       }
//       const emailData = {
//         date: formatDate(booking.date),
//         // startTime: formatTime(booking.startTime),
//         startTime: formatTime(booking.startTime) + " (Coordinated Universal Time)",
//         teacherName: teacher.name,
//         studentName: student.name,
//         meetLink: booking.meetLink,
//         timeLabel: timeLabel === "24h" ? "24 Hours Before" : "2 Hours Before",
//       };
//       console.log(`📧 Sending ${timeLabel} reminder emails...`);
//       await Promise.all([
//         sendEmail({
//           to: studentUser.email,
//           subject: `Class Reminder - ${timeLabel === "24h" ? "24 Hours" : "2 Hours"} to go`,
//           templateName: "reminder",
//           templateData: { ...emailData, recipientName: student.name },
//         }),
//         sendEmail({
//           to: teacherUser.email,
//           subject: `Class Reminder - ${timeLabel === "24h" ? "24 Hours" : "2 Hours"} to go`,
//           templateName: "reminder",
//           templateData: { ...emailData, recipientName: teacher.name },
//         }),
//       ]);
//       // Mark as sent
//       if (timeLabel === "24h") {
//         booking.reminder24hSent = true;
//       } else {
//         booking.reminder2hSent = true;
//       }
//       await booking.save();
//       console.log(`✅ ${timeLabel} reminder sent for booking ${booking._id}`);
//     }
//   } catch (error) {
//     console.error("❌ Error in sendReminderEmails:", error);
//   }
// };
// /**
//  * Send Review Request Emails
//  */
// const sendReviewRequestEmails = async () => {
//   try {
//     const now = new Date();
//     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
//     const completedBookings = await BookingModel.find({
//       status: "completed",
//       updatedAt: { $gte: oneHourAgo, $lte: now },
//       reviewRequestSent: { $ne: true },
//     })
//       .populate("studentId", "name")
//       .populate("teacherId", "name");
//     console.log(`📊 Completed bookings to review: ${completedBookings.length}`);
//     if (!completedBookings.length) return;
//     for (const booking of completedBookings) {
//       const student: any = booking.studentId;
//       const teacher: any = booking.teacherId;
//       if (!student || !teacher) {
//         console.log("❌ Missing student/teacher in review");
//         continue;
//       }
//       // Look up student email from UserModel
//       const studentUser = await UserModel.findOne({ student: student._id }).select("email");
//       if (!studentUser) {
//         console.log(`❌ Could not find user account for student ${student._id}`);
//         continue;
//       }
//       const reviewLink = `${envVars.FRONTEND_URL}/dashboard/student/booking`;
//       console.log("📧 Sending review email to:", studentUser.email);
//       await sendEmail({
//         to: studentUser.email,
//         subject: `Leave a Review for ${teacher.name}`,
//         templateName: "reviewRequest",
//         templateData: {
//           studentName: student.name,
//           teacherName: teacher.name,
//           date: formatDate(booking.date),
//           startTime: formatTime(booking.startTime),
//           reviewLink,
//         },
//       });
//       booking.reviewRequestSent = true;
//       await booking.save();
//       console.log(`✅ Review request sent for booking ${booking._id}`);
//     }
//   } catch (error) {
//     console.error("❌ Error in sendReviewRequestEmails:", error);
//   }
// };
// /**
//  * Start Cron Jobs
//  * Runs every 30 minutes to catch reminders accurately
//  */
// export const startReminderCron = () => {
//   cron.schedule(
//     "0,30 * * * *",
//     async () => {
//       console.log("⏰ Running 24h reminder cron...");
//       await sendReminderEmails("24h");
//     },
//     { timezone: "UTC" },
//   );
//   cron.schedule(
//     "10,40 * * * *",
//     async () => {
//       console.log("⏰ Running 2h reminder cron...");
//       await sendReminderEmails("2h");
//     },
//     { timezone: "UTC" },
//   );
//   cron.schedule(
//     "20,50 * * * *",
//     async () => {
//       console.log("⭐ Running review cron...");
//       await sendReviewRequestEmails();
//     },
//     { timezone: "UTC" },
//   );
//   console.log("✅ Reminder cron scheduled");
// };
// import cron from "node-cron";
// import { BookingModel } from "../modules/booking/booking.model";
// import { UserModel } from "../modules/user/user.model";
// import { sendEmail } from "../utils/sendEmail";
// import { envVars } from "../config";
// /**
//  * Parse booking date + time as UTC
//  */
// const getClassDateTime = (date: string, time: string) => {
//   return new Date(`${date}T${time}:00.000Z`);
// };
// /**
//  * Format "2026-05-10" → "May 10, 2026"
//  */
// const formatDate = (dateStr: string): string => {
//   const [year, month, day] = dateStr.split("-").map(Number);
//   return new Date(year, month - 1, day).toLocaleDateString("en-US", {
//     month: "long",
//     day: "numeric",
//     year: "numeric",
//   });
// };
// /**
//  * Format "09:00" → "9:00 AM"
//  */
// const formatTime = (timeStr: string): string => {
//   const [hour, minute] = timeStr.split(":").map(Number);
//   const ampm = hour >= 12 ? "PM" : "AM";
//   const h12 = hour % 12 || 12;
//   return `${h12}:${minute.toString().padStart(2, "0")} ${ampm}`;
// };
// /**
//  * Send Reminder Emails
//  */
// const sendReminderEmails = async (timeLabel: "24h" | "2h") => {
//   try {
//     const bookings = await BookingModel.find({ status: "scheduled" })
//       .populate("studentId", "name")
//       .populate("teacherId", "name");
//     console.log(`📊 Total scheduled bookings: ${bookings.length}`);
//     if (!bookings.length) return;
//     for (const booking of bookings) {
//       const classDateTime = getClassDateTime(booking.date, booking.startTime);
//       const now = new Date();
//       const diffMs = classDateTime.getTime() - now.getTime();
//       const diffHours = diffMs / (1000 * 60 * 60);
//       console.log(
//         `⏱ Booking ${booking._id} → diffHours: ${diffHours.toFixed(2)}`,
//       );
//       const student: any = booking.studentId;
//       const teacher: any = booking.teacherId;
//       if (!student || !teacher) {
//         console.log("❌ Missing student or teacher after populate");
//         continue;
//       }
//       // Prevent duplicate emails
//       if (timeLabel === "24h" && booking.reminder24hSent) continue;
//       if (timeLabel === "2h" && booking.reminder2hSent) continue;
//       // 24h reminder: ±30 seconds around 24h mark
//       if (timeLabel === "24h" && (diffHours < 23.992 || diffHours > 24.008))
//         continue;
//       // 2h reminder: ±30 seconds around 2h mark
//       if (timeLabel === "2h" && (diffHours < 1.992 || diffHours > 2.008))
//         continue;
//       // Look up emails from UserModel — Student/Teacher docs don't carry email
//       const studentUser = await UserModel.findOne({
//         student: student._id,
//       }).select("email");
//       const teacherUser = await UserModel.findOne({
//         teacher: teacher._id,
//       }).select("email");
//       if (!studentUser || !teacherUser) {
//         console.log(
//           `❌ Could not find user accounts for booking ${booking._id}`,
//         );
//         continue;
//       }
//       const emailData = {
//         date: formatDate(booking.date),
//         startTime:
//           formatTime(booking.startTime) + " (Coordinated Universal Time)",
//         teacherName: teacher.name,
//         studentName: student.name,
//         meetLink: booking.meetLink,
//         timeLabel: timeLabel === "24h" ? "24 Hours Before" : "2 Hours Before",
//       };
//       console.log(`📧 Sending ${timeLabel} reminder emails...`);
//       await Promise.all([
//         sendEmail({
//           to: studentUser.email,
//           subject: `Class Reminder - ${timeLabel === "24h" ? "24 Hours" : "2 Hours"} to go`,
//           templateName: "reminder",
//           templateData: { ...emailData, recipientName: student.name },
//         }),
//         sendEmail({
//           to: teacherUser.email,
//           subject: `Class Reminder - ${timeLabel === "24h" ? "24 Hours" : "2 Hours"} to go`,
//           templateName: "reminder",
//           templateData: { ...emailData, recipientName: teacher.name },
//         }),
//       ]);
//       // Mark as sent
//       if (timeLabel === "24h") {
//         booking.reminder24hSent = true;
//       } else {
//         booking.reminder2hSent = true;
//       }
//       await booking.save();
//       console.log(`✅ ${timeLabel} reminder sent for booking ${booking._id}`);
//     }
//   } catch (error) {
//     console.error("❌ Error in sendReminderEmails:", error);
//   }
// };
// /**
//  * Send Review Request Emails
//  */
// const sendReviewRequestEmails = async () => {
//   try {
//     const now = new Date();
//     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
//     const completedBookings = await BookingModel.find({
//       status: "completed",
//       updatedAt: { $gte: oneHourAgo, $lte: now },
//       reviewRequestSent: { $ne: true },
//     })
//       .populate("studentId", "name")
//       .populate("teacherId", "name");
//     console.log(`📊 Completed bookings to review: ${completedBookings.length}`);
//     if (!completedBookings.length) return;
//     for (const booking of completedBookings) {
//       const student: any = booking.studentId;
//       const teacher: any = booking.teacherId;
//       if (!student || !teacher) {
//         console.log("❌ Missing student/teacher in review");
//         continue;
//       }
//       // Look up student email from UserModel
//       const studentUser = await UserModel.findOne({
//         student: student._id,
//       }).select("email");
//       if (!studentUser) {
//         console.log(
//           `❌ Could not find user account for student ${student._id}`,
//         );
//         continue;
//       }
//       const reviewLink = `${envVars.FRONTEND_URL}/dashboard/student/booking`;
//       console.log("📧 Sending review email to:", studentUser.email);
//       await sendEmail({
//         to: studentUser.email,
//         subject: `Leave a Review for ${teacher.name}`,
//         templateName: "reviewRequest",
//         templateData: {
//           studentName: student.name,
//           teacherName: teacher.name,
//           date: formatDate(booking.date),
//           startTime: formatTime(booking.startTime),
//           reviewLink,
//         },
//       });
//       booking.reviewRequestSent = true;
//       await booking.save();
//       console.log(`✅ Review request sent for booking ${booking._id}`);
//     }
//   } catch (error) {
//     console.error("❌ Error in sendReviewRequestEmails:", error);
//   }
// };
// /**
//  * Start Cron Job
//  * Runs every minute — handles 24h reminder, 2h reminder, and review requests
//  */
// export const startReminderCron = () => {
//   cron.schedule(
//     "* * * * *",
//     async () => {
//       console.log("⏰ Running reminder cron...");
//       await sendReminderEmails("24h");
//       await sendReminderEmails("2h");
//       await sendReviewRequestEmails();
//     },
//     { timezone: "UTC" },
//   );
//   console.log("✅ Reminder cron scheduled");
// };
const node_cron_1 = __importDefault(require("node-cron"));
const booking_model_1 = require("../modules/booking/booking.model");
const user_model_1 = require("../modules/user/user.model");
const sendEmail_1 = require("../utils/sendEmail");
const config_1 = require("../config");
const formatDate = (startTime) => new Date(startTime).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
});
const formatTimeEmail = (startTime, timezone) => {
    try {
        return new Date(startTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone,
            timeZoneName: "long",
        });
    }
    catch (_a) {
        return new Date(startTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "UTC",
            timeZoneName: "short",
        });
    }
};
const sendReminderEmails = (timeLabel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_model_1.BookingModel.find({ status: "scheduled" })
            .populate("studentId", "name")
            .populate("teacherId", "name");
        console.log(`📊 Total scheduled bookings: ${bookings.length}`);
        if (!bookings.length)
            return;
        for (const booking of bookings) {
            const classDateTime = new Date(booking.startTime);
            if (isNaN(classDateTime.getTime())) {
                console.log(`⚠️ Booking ${booking._id} has invalid startTime, skipping`);
                continue;
            }
            const now = new Date();
            const diffMs = classDateTime.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            console.log(`⏱ Booking ${booking._id} → diffHours: ${diffHours.toFixed(2)}`);
            const student = booking.studentId;
            const teacher = booking.teacherId;
            if (!student || !teacher) {
                console.log("❌ Missing student or teacher after populate");
                continue;
            }
            if (timeLabel === "24h" && booking.reminder24hSent)
                continue;
            if (timeLabel === "2h" && booking.reminder2hSent)
                continue;
            if (timeLabel === "24h" && (diffHours < 23.992 || diffHours > 24.008))
                continue;
            if (timeLabel === "2h" && (diffHours < 1.992 || diffHours > 2.008))
                continue;
            const studentUser = yield user_model_1.UserModel.findOne({
                student: student._id,
            }).select("email timezone");
            const teacherUser = yield user_model_1.UserModel.findOne({
                teacher: teacher._id,
            }).select("email timezone");
            if (!studentUser || !teacherUser) {
                console.log(`❌ Could not find user accounts for booking ${booking._id}`);
                continue;
            }
            const studentTz = studentUser.timezone || "UTC";
            const teacherTz = teacherUser.timezone || "UTC";
            const subjectLabel = timeLabel === "24h" ? "24 Hours" : "2 Hours";
            const timeLabelText = timeLabel === "24h" ? "24 Hours Before" : "2 Hours Before";
            const sharedEmailData = {
                date: formatDate(classDateTime),
                teacherName: teacher.name,
                studentName: student.name,
                meetLink: booking.meetLink,
                timeLabel: timeLabelText,
            };
            console.log(`📧 Sending ${timeLabel} reminder emails...`);
            yield Promise.all([
                (0, sendEmail_1.sendEmail)({
                    to: studentUser.email,
                    subject: `Class Reminder - ${subjectLabel} to go`,
                    templateName: "reminder",
                    templateData: Object.assign(Object.assign({}, sharedEmailData), { startTime: formatTimeEmail(classDateTime, studentTz), recipientName: student.name }),
                }),
                (0, sendEmail_1.sendEmail)({
                    to: teacherUser.email,
                    subject: `Class Reminder - ${subjectLabel} to go`,
                    templateName: "reminder",
                    templateData: Object.assign(Object.assign({}, sharedEmailData), { startTime: formatTimeEmail(classDateTime, teacherTz), recipientName: teacher.name }),
                }),
            ]);
            if (timeLabel === "24h") {
                booking.reminder24hSent = true;
            }
            else {
                booking.reminder2hSent = true;
            }
            yield booking.save();
            console.log(`✅ ${timeLabel} reminder sent for booking ${booking._id}`);
        }
    }
    catch (error) {
        console.error("❌ Error in sendReminderEmails:", error);
    }
});
const sendReviewRequestEmails = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const completedBookings = yield booking_model_1.BookingModel.find({
            status: "completed",
            updatedAt: { $gte: oneHourAgo, $lte: now },
            reviewRequestSent: { $ne: true },
        })
            .populate("studentId", "name")
            .populate("teacherId", "name");
        console.log(`📊 Completed bookings to review: ${completedBookings.length}`);
        if (!completedBookings.length)
            return;
        for (const booking of completedBookings) {
            const student = booking.studentId;
            const teacher = booking.teacherId;
            if (!student || !teacher) {
                console.log("❌ Missing student/teacher in review");
                continue;
            }
            const studentUser = yield user_model_1.UserModel.findOne({
                student: student._id,
            }).select("email timezone");
            if (!studentUser) {
                console.log(`❌ Could not find user account for student ${student._id}`);
                continue;
            }
            const studentTz = studentUser.timezone || "UTC";
            const classDateTime = new Date(booking.startTime);
            const reviewLink = `${config_1.envVars.FRONTEND_URL}/dashboard/student/booking`;
            console.log("📧 Sending review email to:", studentUser.email);
            yield (0, sendEmail_1.sendEmail)({
                to: studentUser.email,
                subject: `Leave a Review for ${teacher.name}`,
                templateName: "reviewRequest",
                templateData: {
                    studentName: student.name,
                    teacherName: teacher.name,
                    date: formatDate(classDateTime),
                    startTime: formatTimeEmail(classDateTime, studentTz),
                    reviewLink,
                },
            });
            booking.reviewRequestSent = true;
            yield booking.save();
            console.log(`✅ Review request sent for booking ${booking._id}`);
        }
    }
    catch (error) {
        console.error("❌ Error in sendReviewRequestEmails:", error);
    }
});
const startReminderCron = () => {
    node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("⏰ Running reminder cron...");
        yield sendReminderEmails("24h");
        yield sendReminderEmails("2h");
        yield sendReviewRequestEmails();
    }), { timezone: "UTC" });
    console.log("✅ Reminder cron scheduled");
};
exports.startReminderCron = startReminderCron;
