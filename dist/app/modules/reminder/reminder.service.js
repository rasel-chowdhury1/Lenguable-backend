"use strict";
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
exports.ReminderService = void 0;
const booking_model_1 = require("../booking/booking.model");
const user_model_1 = require("../user/user.model");
const sendEmail_1 = require("../../utils/sendEmail");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendReminderEmails = (timeLabel) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all scheduled bookings
    const bookings = yield booking_model_1.BookingModel.find({ status: "scheduled" });
    if (!bookings.length) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No scheduled bookings found");
    }
    let sentCount = 0;
    for (const booking of bookings) {
        const classDateTime = new Date(booking.startTime);
        const now = new Date();
        const diffMs = classDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (timeLabel === "24h" && (diffHours < 23 || diffHours > 25))
            continue;
        if (timeLabel === "2h" && (diffHours < 1 || diffHours > 3))
            continue;
        const [student, teacher] = yield Promise.all([
            user_model_1.UserModel.findById(booking.studentId),
            user_model_1.UserModel.findById(booking.teacherId),
        ]);
        if (!student || !teacher)
            continue;
        const emailData = {
            date: classDateTime.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
            startTime: classDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }),
            teacherName: teacher.name,
            studentName: student.name,
            meetLink: booking.meetLink,
            timeLabel: timeLabel === "24h" ? "24 Hours Before" : "2 Hours Before",
        };
        // Send to student
        yield (0, sendEmail_1.sendEmail)({
            to: student.email,
            subject: `Class Reminder - ${timeLabel} before your class`,
            templateName: "reminder",
            templateData: Object.assign(Object.assign({}, emailData), { recipientName: student.name }),
        });
        // Send to teacher
        yield (0, sendEmail_1.sendEmail)({
            to: teacher.email,
            subject: `Class Reminder - ${timeLabel} before your class`,
            templateName: "reminder",
            templateData: Object.assign(Object.assign({}, emailData), { recipientName: teacher.name }),
        });
        sentCount++;
    }
    return { sentCount };
});
exports.ReminderService = { sendReminderEmails };
