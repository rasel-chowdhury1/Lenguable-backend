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
exports.LessonService = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const lesson_model_1 = require("./lesson.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createLesson = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistingLesson = yield lesson_model_1.LessonModel.findOne({
        title: payload.title,
    });
    if (isExistingLesson) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Lesson already exist!");
    }
    // Auto-assign the next order value
    const lastLesson = yield lesson_model_1.LessonModel.findOne().sort({ order: -1 });
    const nextOrder = lastLesson ? lastLesson.order + 1 : 0;
    const result = yield lesson_model_1.LessonModel.create(Object.assign(Object.assign({}, payload), { order: nextOrder }));
    return result;
});
const getAllLessons = () => __awaiter(void 0, void 0, void 0, function* () {
    // Sort by order ascending so the admin-defined order is respected
    const result = yield lesson_model_1.LessonModel.find().sort({ order: 1 });
    return result;
});
const getSingleLesson = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield lesson_model_1.LessonModel.findById(id);
    return result;
});
const updateLesson = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistLesson = yield lesson_model_1.LessonModel.findById(id);
    if (!isExistLesson) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Lesson not found!");
    }
    const result = yield lesson_model_1.LessonModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteLesson = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield lesson_model_1.LessonModel.findByIdAndDelete(id);
    return result;
});
const reorderLessons = (orderedIds) => __awaiter(void 0, void 0, void 0, function* () {
    if (!orderedIds || orderedIds.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "orderedIds must be a non-empty array");
    }
    const bulkOps = orderedIds.map((id, index) => ({
        updateOne: {
            filter: { _id: new mongoose_1.Types.ObjectId(id) },
            update: { $set: { order: index } },
        },
    }));
    yield lesson_model_1.LessonModel.bulkWrite(bulkOps);
});
exports.LessonService = {
    createLesson,
    getAllLessons,
    getSingleLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
};
