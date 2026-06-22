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
exports.BookingService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const booking_model_1 = require("./booking.model");
const student_model_1 = require("../student/student.model");
const user_model_1 = require("../user/user.model");
const teacher_model_1 = require("../teacher/teacher.model");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const googleMeet_1 = require("../../helpers/googleMeet");
const luxon_1 = require("luxon");
const sendEmail_1 = require("../../utils/sendEmail");
const config_1 = require("../../config");
const availability_model_1 = require("../availability/availability.model");
const computeStatus = (startTime, storedStatus) => {
    if (storedStatus === "cancelled")
        return "cancelled";
    if (storedStatus === "cancelledByStudent")
        return "cancelled";
    const classEnd = new Date(new Date(startTime).getTime() + 60 * 60 * 1000);
    return classEnd <= new Date() ? "completed" : "scheduled";
};
const isValidTimezone = (tz) => {
    if (!tz)
        return false;
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    }
    catch (_a) {
        return false;
    }
};
const formatDateEmail = (startTime, timezone) => {
    const resolvedTz = isValidTimezone(timezone) ? timezone : "UTC";
    return new Date(startTime).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: resolvedTz,
    });
};
const formatTimeEmail = (startTime, timezone) => {
    const resolvedTz = isValidTimezone(timezone) ? timezone : "UTC";
    return new Date(startTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: resolvedTz,
    });
};
const createBooking = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { teacherId: payloadTeacherId, teacher, startTime, endTime } = payload;
    console.log("== create booking payload =>>>> ", payload);
    const teacherId = payloadTeacherId || teacher;
    // resolve these before the transaction (read-only, no side effects)
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    // UTC ISO time received from frontend
    const startUtcDate = new Date(startTime);
    const endUtcDate = new Date(endTime);
    if (isNaN(startUtcDate.getTime())) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid start time");
    }
    // const studentTz = timezone || user.timezone || "UTC";
    // const utcStart = localToUtc(startTime, date, studentTz);
    // const startUtcDate = new Date(
    //   `${utcStart.utcDate}T${utcStart.utcTime}:00.000Z`,
    // );
    const teacherUser = yield user_model_1.UserModel.findOne({ teacher: teacherId }).select("email name timezone");
    const studentUser = yield user_model_1.UserModel.findOne({ student: user.student }).select("email name timezone");
    if (!teacherUser || !studentUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    // external API call outside transaction — no DB rollback needed if this fails
    const meetLink = yield (0, googleMeet_1.createGoogleMeetLink)(studentUser.email, teacherUser.email, startUtcDate, endUtcDate, teacherId);
    const session = yield mongoose_1.default.startSession();
    let bookingId;
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const student = yield student_model_1.StudentModel.findById(user.student).session(session);
            if (!student)
                throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
            if ((student.credits || 0) < 1) {
                throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Not enough credits. Please purchase a package.");
            }
            const availability = yield availability_model_1.AvailabilityModel.findOne({
                teacherId,
                slots: { $elemMatch: { startTime: startUtcDate, isBooked: false } },
            }).session(session);
            if (!availability) {
                throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Slot not available or already booked");
            }
            const slotIndex = availability.slots.findIndex((s) => new Date(s.startTime).getTime() === startUtcDate.getTime() &&
                s.isBooked === false);
            if (slotIndex === -1) {
                throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Slot already booked");
            }
            availability.slots[slotIndex].isBooked = true;
            yield availability.save({ session });
            student.credits = ((_a = student.credits) !== null && _a !== void 0 ? _a : 0) - 1;
            yield student.save({ session });
            const [booking] = yield booking_model_1.BookingModel.create([{ studentId: student._id, teacherId, startTime: startUtcDate, endTime: endUtcDate, meetLink, status: "scheduled" }], { session });
            yield student_model_1.StudentModel.findByIdAndUpdate(student._id, { $push: { booking: booking._id } }, { session });
            yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, { $push: { bookings: booking._id } }, { session });
            bookingId = booking._id;
        }));
    }
    finally {
        session.endSession();
    }
    const teacherTz = teacherUser.timezone || "UTC";
    const studentTz2 = studentUser.timezone || "UTC";
    console.log({ teacherTz, studentTz2 });
    Promise.allSettled([
        (0, sendEmail_1.sendEmail)({
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
                meetLink,
            },
        }),
        (0, sendEmail_1.sendEmail)({
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
                meetLink,
            },
        }),
    ]).catch((err) => console.error("Failed to send confirmation emails:", err));
    return yield booking_model_1.BookingModel.findById(bookingId)
        .populate("studentId", "name email")
        .populate("teacherId", "name email");
});
const getMyBookings = (userId, viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const tz = viewerTimezone || user.timezone || "UTC";
    let bookings;
    if (user.student) {
        bookings = yield booking_model_1.BookingModel.find({ studentId: user.student })
            .populate("teacherId", "name email nationality experience")
            .sort({ startTime: 1 });
    }
    else if (user.teacher) {
        bookings = yield booking_model_1.BookingModel.find({ teacherId: user.teacher })
            .populate("studentId", "name email")
            .sort({ startTime: 1 });
    }
    else {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User has no student or teacher profile");
    }
    return bookings.map((b) => {
        const obj = b.toObject();
        const dt = luxon_1.DateTime.fromJSDate(new Date(obj.startTime)).setZone(tz);
        return Object.assign(Object.assign({}, obj), { date: dt.toFormat("yyyy-MM-dd"), day: dt.toFormat("cccc"), startTime: obj.startTime, status: computeStatus(new Date(obj.startTime), obj.status) });
    });
});
const cancelBooking = (userId, bookingId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const booking = yield booking_model_1.BookingModel.findById(bookingId);
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    const isStudent = user.student && booking.studentId.toString() === user.student.toString();
    const isTeacher = user.teacher && booking.teacherId.toString() === user.teacher.toString();
    if (!isStudent && !isTeacher) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not allowed to cancel this booking");
    }
    if (booking.status === "cancelled" ||
        booking.status === "cancelledByStudent") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Booking is already cancelled");
    }
    const now = new Date();
    const classDateTime = new Date(booking.startTime);
    if (classDateTime <= now) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot cancel a class that has already passed");
    }
    const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isWithin24Hours = hoursUntilClass <= 24;
    let responseMessage = "";
    if (isTeacher) {
        booking.status = "cancelled";
        booking.cancellationReason = reason;
        booking.cancelledBy = "teacher";
        yield booking.save();
        yield student_model_1.StudentModel.findByIdAndUpdate(booking.studentId, {
            $inc: { credits: 1 },
        });
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(booking.teacherId, {
            $inc: { totalCanceledClasses: 1 },
        });
        responseMessage = isWithin24Hours
            ? "Booking cancelled by teacher within 24 hours. Student credit has been refunded."
            : "Booking cancelled. Student credit has been refunded.";
    }
    else {
        if (isWithin24Hours) {
            booking.status = "cancelledByStudent";
            booking.cancellationReason = reason;
            booking.cancelledBy = "student";
            yield booking.save();
            yield teacher_model_1.TeacherModel.findByIdAndUpdate(booking.teacherId, {
                $inc: {
                    totalEarnings: 10,
                    unpaidEarnings: 10,
                    totalCanceledClasses: 1,
                },
            });
            responseMessage =
                "Booking cancelled within 24 hours. No credit refund — teacher has been paid.";
        }
        else {
            booking.status = "cancelled";
            booking.cancellationReason = reason;
            booking.cancelledBy = "student";
            yield booking.save();
            yield student_model_1.StudentModel.findByIdAndUpdate(booking.studentId, {
                $inc: { credits: 1 },
            });
            yield teacher_model_1.TeacherModel.findByIdAndUpdate(booking.teacherId, {
                $inc: { totalCanceledClasses: 1 },
            });
            responseMessage =
                "Booking cancelled. 1 credit has been refunded to your account.";
        }
    }
    const teacherUser = yield user_model_1.UserModel.findOne({
        teacher: booking.teacherId,
    }).select("email name timezone");
    const studentUser = yield user_model_1.UserModel.findOne({
        student: booking.studentId,
    }).select("email name timezone");
    const adminUser = yield user_model_1.UserModel.findOne({
        email: config_1.envVars.ADMIN_EMAIL,
    }).select("email name timezone");
    yield availability_model_1.AvailabilityModel.updateOne({
        teacherId: booking.teacherId,
        "slots.startTime": new Date(booking.startTime),
    }, { $set: { "slots.$.isBooked": false } });
    const cancelledBy = isTeacher ? "teacher" : "student";
    const refunded = isTeacher || !isWithin24Hours;
    const teacherTz = (teacherUser === null || teacherUser === void 0 ? void 0 : teacherUser.timezone) || "UTC";
    const studentTz = (studentUser === null || studentUser === void 0 ? void 0 : studentUser.timezone) || "UTC";
    const sharedData = {
        teacherName: (teacherUser === null || teacherUser === void 0 ? void 0 : teacherUser.name) || "Teacher",
        studentName: (studentUser === null || studentUser === void 0 ? void 0 : studentUser.name) || "Student",
        cancelledBy,
        reason,
        refunded,
    };
    const recipients = [];
    if (teacherUser === null || teacherUser === void 0 ? void 0 : teacherUser.email)
        recipients.push({ email: teacherUser.email, recipientName: teacherUser.name || "Teacher", tz: teacherTz });
    if (studentUser === null || studentUser === void 0 ? void 0 : studentUser.email)
        recipients.push({ email: studentUser.email, recipientName: studentUser.name || "Student", tz: studentTz });
    if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.email)
        recipients.push({ email: adminUser.email, recipientName: adminUser.name || "Admin", tz: (adminUser === null || adminUser === void 0 ? void 0 : adminUser.timezone) || "UTC" });
    yield Promise.allSettled(recipients.map(({ email, recipientName, tz }) => (0, sendEmail_1.sendEmail)({
        to: email,
        subject: "Class Cancellation Notice",
        templateName: "cancellationNotification",
        templateData: Object.assign(Object.assign({}, sharedData), { formattedDate: formatDateEmail(new Date(booking.startTime), tz), formattedTime: formatTimeEmail(new Date(booking.startTime), tz), recipientName }),
    })));
    return { refunded, cancelledBy, message: responseMessage };
});
const TEACHER_RATE = 10;
const markTeacherJoined = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only teachers can call this");
    }
    const booking = yield booking_model_1.BookingModel.findById(bookingId);
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    if (booking.teacherId.toString() !== user.teacher.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This is not your booking");
    }
    if (booking.teacherJoined) {
        return { success: true, alreadyJoined: true };
    }
    booking.teacherJoined = true;
    yield booking.save();
    yield teacher_model_1.TeacherModel.findByIdAndUpdate(user.teacher, {
        $inc: {
            totalClasses: 1,
            totalEarnings: TEACHER_RATE,
            unpaidEarnings: TEACHER_RATE,
        },
    });
    return { success: true };
});
const markStudentJoined = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only students can call this");
    }
    const booking = yield booking_model_1.BookingModel.findById(bookingId);
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    if (booking.studentId.toString() !== user.student.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This is not your booking");
    }
    if (booking.studentJoined) {
        return { success: true, alreadyJoined: true };
    }
    booking.studentJoined = true;
    yield booking.save();
    if (new Date(booking.endTime) <= new Date()) {
        yield student_model_1.StudentModel.findByIdAndUpdate(user.student, {
            $inc: { totalCompletedClasses: 1 },
        });
    }
    return { success: true };
});
exports.BookingService = {
    createBooking,
    getMyBookings,
    cancelBooking,
    markTeacherJoined,
    markStudentJoined
};
