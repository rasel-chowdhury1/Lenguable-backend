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
exports.NoteService = void 0;
const note_model_1 = require("./note.model");
const user_model_1 = require("../user/user.model");
const student_model_1 = require("../student/student.model");
const booking_model_1 = require("../booking/booking.model");
const lesson_model_1 = require("../lesson/lesson.model");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// existing
const createNote = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield note_model_1.Note.create(payload);
    return result;
});
const getAllNotes = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield note_model_1.Note.find()
        .populate("studentId", "name email")
        .populate("teacherId", "name email");
});
const getNotesByStudent = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield note_model_1.Note.find({ studentId }).populate("teacherId", "name email");
});
const LEVEL_ORDER = ["A0", "A1", "A2", "B1", "B2", "C1"];
// const getMyStudents = async (userId: string) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
//   }
//   const bookings = await BookingModel.find({}).populate(
//     "studentId",
//     "name email interests aboutMe unlockedLessons",
//   );
//   const studentMap = new Map();
//   for (const booking of bookings) {
//     const student = booking.studentId as any;
//     if (!student) continue;
//     const studentKey = student._id.toString();
//     if (!studentMap.has(studentKey)) {
//       // Get all unlocked lessons to find highest level
//       const unlockedLessons = await LessonModel.find({
//         _id: { $in: student.unlockedLessons || [] },
//       }).select("level");
//       const highestLevel = unlockedLessons.reduce(
//         (highest: string, lesson: any) => {
//           const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
//           const highestIdx = LEVEL_ORDER.indexOf(highest);
//           return lessonIdx > highestIdx ? lesson.level : highest;
//         },
//         "A0",
//       );
//       studentMap.set(studentKey, {
//         _id: student._id,
//         name: student.name,
//         email: student.email,
//         unlockedLessons: student.unlockedLessons || [],
//         lessonsCompleted: 0,
//         currentLevel: highestLevel,
//       });
//     }
//     if (booking.teacherJoined === true) {
//       const existing = studentMap.get(studentKey);
//       existing.lessonsCompleted += 1;
//     }
//   }
//   return Array.from(studentMap.values());
// };
const getMyStudents = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const allStudents = yield student_model_1.StudentModel.find().select("name email unlockedLessons totalCompletedClasses");
    const result = yield Promise.all(allStudents.map((student) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const unlockedLessons = yield lesson_model_1.LessonModel.find({
            _id: { $in: student.unlockedLessons || [] },
        }).select("level");
        const highestLevel = unlockedLessons.reduce((highest, lesson) => {
            const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
            const highestIdx = LEVEL_ORDER.indexOf(highest);
            return lessonIdx > highestIdx ? lesson.level : highest;
        }, "A0");
        return {
            _id: student._id,
            name: student.name,
            email: student.email,
            unlockedLessons: student.unlockedLessons || [],
            lessonsCompleted: (_a = student.totalCompletedClasses) !== null && _a !== void 0 ? _a : 0,
            currentLevel: highestLevel,
        };
    })));
    return result;
});
// const getMyStudents = async (userId: string) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
//   }
//   // Query ALL students directly, not via bookings
//   const allStudents = await StudentModel.find().select(
//     "name email unlockedLessons"
//   );
//   const result = await Promise.all(
//     allStudents.map(async (student: any) => {
//       // Get highest unlocked level
//       const unlockedLessons = await LessonModel.find({
//         _id: { $in: student.unlockedLessons || [] },
//       }).select("level");
//       const highestLevel = unlockedLessons.reduce(
//         (highest: string, lesson: any) => {
//           const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
//           const highestIdx = LEVEL_ORDER.indexOf(highest);
//           return lessonIdx > highestIdx ? lesson.level : highest;
//         },
//         "A0"
//       );
//       // Count completed lessons from bookings
//       const completedCount = await BookingModel.countDocuments({
//         studentId: student._id,
//         teacherJoined: true,
//       });
//       return {
//         _id: student._id,
//         name: student.name,
//         email: student.email,
//         unlockedLessons: student.unlockedLessons || [],
//         lessonsCompleted: completedCount,
//         currentLevel: highestLevel,
//       };
//     })
//   );
//   return result;
// };
const getAllStudents = () => __awaiter(void 0, void 0, void 0, function* () {
    const allStudents = yield student_model_1.StudentModel.find().select("name email unlockedLessons");
    const result = yield Promise.all(allStudents.map((student) => __awaiter(void 0, void 0, void 0, function* () {
        const unlockedLessons = yield lesson_model_1.LessonModel.find({
            _id: { $in: student.unlockedLessons || [] },
        }).select("level");
        const highestLevel = unlockedLessons.reduce((highest, lesson) => {
            const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
            const highestIdx = LEVEL_ORDER.indexOf(highest);
            return lessonIdx > highestIdx ? lesson.level : highest;
        }, "A0");
        const lessonsCompleted = yield booking_model_1.BookingModel.countDocuments({
            studentId: student._id,
            teacherJoined: true,
        });
        return {
            _id: student._id,
            name: student.name,
            email: student.email,
            unlockedLessons: student.unlockedLessons || [],
            lessonsCompleted,
            currentLevel: highestLevel,
        };
    })));
    return result;
});
// Teacher: toggle unlock/lock a lesson for a student
const unlockLesson = (userId, studentId, lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const student = yield student_model_1.StudentModel.findById(studentId);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const lesson = yield lesson_model_1.LessonModel.findById(lessonId);
    if (!lesson) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Lesson not found");
    }
    const alreadyUnlocked = (student.unlockedLessons || [])
        .map((id) => id.toString())
        .includes(lessonId);
    const updatedStudent = yield student_model_1.StudentModel.findByIdAndUpdate(studentId, alreadyUnlocked
        ? { $pull: { unlockedLessons: lessonId } }
        : { $addToSet: { unlockedLessons: lessonId } }, { new: true });
    return {
        unlockedLessons: (updatedStudent === null || updatedStudent === void 0 ? void 0 : updatedStudent.unlockedLessons) || [],
        action: alreadyUnlocked ? "locked" : "unlocked",
        lessonTitle: lesson.title,
    };
});
// Teacher: get all lessons with unlock status for a specific student
const getLessonsForStudent = (userId, studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const student = yield student_model_1.StudentModel.findById(studentId);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const allLessons = yield lesson_model_1.LessonModel.find().sort({ level: 1 });
    const unlockedIds = (student.unlockedLessons || []).map((id) => id.toString());
    return allLessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        level: lesson.level,
        isLock: !unlockedIds.includes(lesson._id.toString()),
    }));
});
// Student: get all lessons — locked ones have content/exercises hidden
const getMyLessons = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const student = yield student_model_1.StudentModel.findById(user.student);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const allLessons = yield lesson_model_1.LessonModel.find().sort({ level: 1 });
    const unlockedIds = (student.unlockedLessons || []).map((id) => id.toString());
    return allLessons.map((lesson) => {
        const isUnlocked = unlockedIds.includes(lesson._id.toString());
        return {
            _id: lesson._id,
            title: lesson.title,
            level: lesson.level,
            file: isUnlocked ? lesson.file : null,
            exercises: isUnlocked ? lesson.exercises : null,
            isLock: !isUnlocked,
        };
    });
});
exports.NoteService = {
    createNote,
    getAllNotes,
    getNotesByStudent,
    getMyStudents,
    getAllStudents,
    unlockLesson,
    getLessonsForStudent,
    getMyLessons,
};
