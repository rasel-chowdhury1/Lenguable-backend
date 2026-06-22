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
exports.TeacherController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const teacher_service_1 = require("./teacher.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createTeacher = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = yield teacher_service_1.TeacherServices.createTeacher(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Teacher created successfully !",
        data: teacher,
    });
}));
const getAllTeachers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const teachers = yield teacher_service_1.TeacherServices.getAllTeachers();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Teachers retrieved successfully !",
        data: teachers,
    });
}));
const getSingleTeacher = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const teacherId = req.params.id;
    const teacher = yield teacher_service_1.TeacherServices.getSingleTeacher(teacherId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Teacher retrieved successfully !",
        data: teacher,
    });
}));
const updateTeacher = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const teacherId = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { profilePicture: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = yield teacher_service_1.TeacherServices.updateTeacher(teacherId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Teacher updated successfully !",
        data: result,
    });
}));
const deleteTeacher = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const teacherId = req.params.id;
    const result = yield teacher_service_1.TeacherServices.deleteTeacher(teacherId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Teacher deleted successfully !",
        data: result,
    });
}));
exports.TeacherController = {
    createTeacher,
    getAllTeachers,
    getSingleTeacher,
    updateTeacher,
    deleteTeacher,
};
