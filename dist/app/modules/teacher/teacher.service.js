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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../config");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const teacher_model_1 = require("./teacher.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../user/user.model");
const luxon_1 = require("luxon");
const availability_model_1 = require("../availability/availability.model");
const booking_model_1 = require("../booking/booking.model");
const student_model_1 = require("../student/student.model");
const createTeacher = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, timezone } = payload, rest = __rest(payload, ["email", "password", "timezone"]);
    // Duplicate check outside the transaction — read-only, no rollback needed
    const isUserExist = yield teacher_model_1.TeacherModel.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Teacher already exists!");
    }
    // Hash before the transaction — bcrypt is CPU-bound, not a DB operation
    const hashPassword = yield bcryptjs_1.default.hash(password, Number(config_1.envVars.BCRYPT_SALT_ROUND));
    const session = yield mongoose_1.default.startSession();
    let result;
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            const [teacher] = yield teacher_model_1.TeacherModel.create([Object.assign({ email, password: hashPassword }, rest)], { session });
            const [user] = yield user_model_1.UserModel.create([
                {
                    teacher: teacher._id,
                    name: teacher.name,
                    email: teacher.email,
                    password: hashPassword,
                    role: "TEACHER",
                    timezone: timezone || "UTC",
                },
            ], { session });
            // Link the user back to the teacher record so both sides of the ref are set
            yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacher._id, { user: user._id }, { session });
            result = { teacher, user };
        }));
    }
    finally {
        session.endSession();
    }
    return result;
});
const convertAvailabilitiesToTimezone = (availabilities, tz) => {
    const nowUtc = new Date();
    const allSlots = [];
    for (const avail of availabilities) {
        const obj = avail.toObject ? avail.toObject() : avail;
        for (const slot of obj.slots || []) {
            if (new Date(slot.startTime) >= nowUtc) {
                allSlots.push(slot);
            }
        }
    }
    allSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const grouped = {};
    for (const slot of allSlots) {
        const dt = luxon_1.DateTime.fromJSDate(new Date(slot.startTime)).setZone(tz);
        const localDate = dt.toFormat("yyyy-MM-dd");
        const localDay = dt.toFormat("cccc");
        if (!grouped[localDate]) {
            grouped[localDate] = { day: localDay, date: localDate, slots: [] };
        }
        grouped[localDate].slots.push({
            _id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
        });
    }
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};
const getAllTeachers = (viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const tz = viewerTimezone || "UTC";
    const teachers = yield teacher_model_1.TeacherModel.find()
        .populate("availabilities")
        .populate("bookings");
    return teachers.map((teacher) => {
        const obj = teacher.toObject();
        return Object.assign(Object.assign({}, obj), { availabilities: convertAvailabilitiesToTimezone(obj.availabilities || [], tz) });
    });
});
const getSingleTeacher = (teacherId, viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const tz = viewerTimezone || "UTC";
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId)
        .populate("availabilities")
        .populate("bookings");
    if (!teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const obj = teacher.toObject();
    return Object.assign(Object.assign({}, obj), { availabilities: convertAvailabilitiesToTimezone(obj.availabilities || [], tz) });
});
const updateTeacher = (teacherId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId);
    if (!teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const updatedTeacher = yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacher._id, payload, { new: true })
        .populate("availabilities")
        .populate("bookings");
    const userUpdate = {};
    if (payload.name)
        userUpdate.name = payload.name;
    if (payload.email)
        userUpdate.email = payload.email;
    if (Object.keys(userUpdate).length > 0) {
        yield user_model_1.UserModel.updateOne({ teacher: teacherId }, { $set: userUpdate });
    }
    return updatedTeacher;
});
const deleteTeacher = (teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId);
    if (!teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    // 1. Find all bookings for this teacher to clean up student refs
    const teacherBookings = yield booking_model_1.BookingModel.find({ teacherId });
    const bookingIds = teacherBookings.map((b) => b._id);
    // 2. Remove booking refs from all students who booked this teacher
    if (bookingIds.length > 0) {
        yield student_model_1.StudentModel.updateMany({ booking: { $in: bookingIds } }, { $pull: { booking: { $in: bookingIds } } });
    }
    // 3. Delete all bookings for this teacher
    yield booking_model_1.BookingModel.deleteMany({ teacherId });
    // 4. Delete all availability records for this teacher
    yield availability_model_1.AvailabilityModel.deleteMany({ teacherId });
    // 5. Delete the teacher's user account
    yield user_model_1.UserModel.findOneAndDelete({ teacher: teacherId });
    // 6. Delete the teacher
    const deletedTeacher = yield teacher_model_1.TeacherModel.findByIdAndDelete(teacherId);
    return deletedTeacher;
});
exports.TeacherServices = {
    createTeacher,
    getAllTeachers,
    getSingleTeacher,
    updateTeacher,
    deleteTeacher,
};
