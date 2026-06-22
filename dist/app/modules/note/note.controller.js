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
exports.NoteController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const note_service_1 = require("./note.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
// existing
const createNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield note_service_1.NoteService.createNote(req.body);
    res.status(http_status_codes_1.default.CREATED).json({
        success: true,
        message: "Note created successfully",
        data: result,
    });
});
const getAllNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield note_service_1.NoteService.getAllNotes();
    res.status(http_status_codes_1.default.OK).json({
        success: true,
        message: "Notes retrieved successfully",
        data: result,
    });
});
const getNotesByStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const result = yield note_service_1.NoteService.getNotesByStudent(studentId);
    res.status(http_status_codes_1.default.OK).json({
        success: true,
        message: "Student notes retrieved successfully",
        data: result,
    });
});
// new
const getMyStudents = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield note_service_1.NoteService.getMyStudents(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Students retrieved successfully",
        data: result,
    });
}));
const unlockLesson = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { studentId } = req.params;
    const { lessonId } = req.body;
    if (!lessonId) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            statusCode: 400,
            message: "lessonId is required",
            data: null,
        });
    }
    const result = yield note_service_1.NoteService.unlockLesson(userId, studentId, lessonId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: `Lesson ${result.action} successfully`,
        data: result,
    });
}));
const getLessonsForStudent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { studentId } = req.params;
    const result = yield note_service_1.NoteService.getLessonsForStudent(userId, studentId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Lessons retrieved successfully",
        data: result,
    });
}));
const getMyLessons = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield note_service_1.NoteService.getMyLessons(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Lessons retrieved successfully",
        data: result,
    });
}));
const getAllStudents = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield note_service_1.NoteService.getAllStudents();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "All students retrieved successfully",
        data: result,
    });
}));
exports.NoteController = {
    createNote,
    getAllNotes,
    getNotesByStudent,
    getMyStudents,
    getAllStudents,
    unlockLesson,
    getLessonsForStudent,
    getMyLessons,
};
