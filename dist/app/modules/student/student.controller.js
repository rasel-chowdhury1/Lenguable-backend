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
exports.StudentControllers = void 0;
const student_service_1 = require("./student.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createStudent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield student_service_1.StudentServices.createStudent(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Student created successfully",
        data: result,
    });
}));
const getAllStudents = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield student_service_1.StudentServices.getAllStudents();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Students retrieved successfully",
        data: result,
    });
}));
const getSingleStudent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = req.params.id;
    const result = yield student_service_1.StudentServices.getSingleStudent(studentId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Student retrieved successfully",
        data: result,
    });
}));
const updateStudent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const studentId = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { profilePicture: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = yield student_service_1.StudentServices.updateStudent(studentId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Student updated successfully",
        data: result,
    });
}));
const deleteStudent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = req.params.id;
    const result = yield student_service_1.StudentServices.deleteStudent(studentId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Student deleted successfully",
        data: result,
    });
}));
const addCredits = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = req.params.id;
    const { credits } = req.body;
    const result = yield student_service_1.StudentServices.addCredits(studentId, Number(credits));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: `${credits} credits added successfully`,
        data: result,
    });
}));
const removeCredits = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = req.params.id;
    const { credits } = req.body;
    const result = yield student_service_1.StudentServices.removeCredits(studentId, Number(credits));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: `${credits} credits removed successfully`,
        data: result,
    });
}));
exports.StudentControllers = {
    createStudent,
    getAllStudents,
    getSingleStudent,
    updateStudent,
    deleteStudent,
    addCredits,
    removeCredits,
};
