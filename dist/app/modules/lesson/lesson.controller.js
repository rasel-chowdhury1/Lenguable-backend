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
exports.LessonController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const lesson_service_1 = require("./lesson.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const config_1 = require("../../config");
const createLesson = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = Object.assign(Object.assign({}, req.body), { file: `${config_1.envVars.UPLOAD_URL}/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}` });
    const result = yield lesson_service_1.LessonService.createLesson(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Lesson created successfully!",
        data: result,
    });
}));
const getAllLessons = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield lesson_service_1.LessonService.getAllLessons();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Lessons retrieved successfully!",
        data: result,
    });
}));
const getSingleLesson = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield lesson_service_1.LessonService.getSingleLesson(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Lesson retrieved successfully!",
        data: result,
    });
}));
const updateLesson = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Parse JSON string from FormData "data" field
    const parsedData = req.body.data ? JSON.parse(req.body.data) : req.body;
    // Only update file if a new one was uploaded
    const payload = Object.assign(Object.assign({}, parsedData), (req.file && { file: `${config_1.envVars.UPLOAD_URL}/${req.file.filename}` }));
    const result = yield lesson_service_1.LessonService.updateLesson(id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Lesson updated successfully!",
        data: result,
    });
}));
const deleteLesson = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield lesson_service_1.LessonService.deleteLesson(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Lesson deleted successfully!",
        data: result,
    });
}));
const reorderLessons = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderedIds } = req.body;
    yield lesson_service_1.LessonService.reorderLessons(orderedIds);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Lessons reordered successfully!",
        data: null,
    });
}));
exports.LessonController = {
    createLesson,
    getAllLessons,
    getSingleLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
};
