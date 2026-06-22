"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonModel = void 0;
const mongoose_1 = require("mongoose");
const lessonSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    level: {
        type: String,
        enum: ["A0", "A1", "A2", "B1", "B2", "C1", "C2"],
        required: true,
    },
    file: {
        type: String,
    },
    exercises: {
        type: [String],
    },
    isLock: {
        type: Boolean,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.LessonModel = (0, mongoose_1.model)("Lesson", lessonSchema);
