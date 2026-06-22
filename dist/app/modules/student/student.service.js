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
exports.StudentServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const student_model_1 = require("./student.model");
const config_1 = require("../../config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../user/user.model");
const createStudent = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, timezone } = payload, rest = __rest(payload, ["email", "password", "timezone"]);
    // Duplicate check outside the transaction — read-only, no rollback needed
    const isUserExist = yield student_model_1.StudentModel.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Student already exist !");
    }
    // Hash before the transaction — bcrypt is CPU-bound, not a DB operation
    const hashPassword = yield bcryptjs_1.default.hash(password, Number(config_1.envVars.BCRYPT_SALT_ROUND));
    const session = yield mongoose_1.default.startSession();
    let createdUser;
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            const [student] = yield student_model_1.StudentModel.create([Object.assign({ email, password: hashPassword }, rest)], { session });
            const [user] = yield user_model_1.UserModel.create([
                {
                    student: student._id,
                    name: student.name,
                    email: student.email,
                    password: hashPassword,
                    role: "STUDENT",
                    timezone: timezone || "UTC",
                },
            ], { session });
            // Link the user back to the student record so both sides of the ref are set
            yield student_model_1.StudentModel.findByIdAndUpdate(student._id, { user: user._id }, { session });
            createdUser = user;
        }));
    }
    finally {
        session.endSession();
    }
    return createdUser;
});
const getAllStudents = () => __awaiter(void 0, void 0, void 0, function* () {
    const students = yield student_model_1.StudentModel.find()
        .populate("user", "-password")
        .populate({
        path: "booking",
        select: "date status teacherId",
        populate: { path: "teacherId", select: "name email" },
    })
        .populate("unlockedLessons");
    return students;
});
const getSingleStudent = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield student_model_1.StudentModel.findById(studentId).populate("user", "-password");
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    return student;
});
const updateStudent = (studentId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield student_model_1.StudentModel.findById(studentId);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const updatedStudent = yield student_model_1.StudentModel.findByIdAndUpdate(student._id, payload, { new: true }).populate("user", "-password");
    // Sync name and email to UserModel if they were updated
    const userUpdate = {};
    if (payload.name)
        userUpdate.name = payload.name;
    if (payload.email)
        userUpdate.email = payload.email;
    if (Object.keys(userUpdate).length > 0) {
        yield user_model_1.UserModel.updateOne({ student: studentId }, { $set: userUpdate });
    }
    return updatedStudent;
});
const deleteStudent = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield student_model_1.StudentModel.findById(studentId);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    yield student_model_1.StudentModel.findByIdAndDelete(studentId);
    yield user_model_1.UserModel.deleteOne({ student: studentId }); // add this
    return { message: "Student deleted successfully" };
});
const addCredits = (studentId, credits) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield student_model_1.StudentModel.findById(studentId);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    if (!credits || credits < 1) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Credits must be at least 1");
    }
    const updatedStudent = yield student_model_1.StudentModel.findByIdAndUpdate(studentId, { $inc: { credits } }, { new: true });
    return updatedStudent;
});
const removeCredits = (studentId, credits) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const student = yield student_model_1.StudentModel.findById(studentId);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    if (!credits || credits < 1) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Credits must be at least 1");
    }
    if (((_a = student.credits) !== null && _a !== void 0 ? _a : 0) < credits) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Student does not have enough credits");
    }
    const updatedStudent = yield student_model_1.StudentModel.findByIdAndUpdate(studentId, { $inc: { credits: -credits } }, { new: true });
    return updatedStudent;
});
exports.StudentServices = {
    createStudent,
    getAllStudents,
    getSingleStudent,
    updateStudent,
    deleteStudent,
    addCredits,
    removeCredits,
};
