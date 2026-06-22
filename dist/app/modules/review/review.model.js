"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// One review per teacher per student
ReviewSchema.index({ studentId: 1, teacherId: 1 }, { unique: true });
exports.ReviewModel = (0, mongoose_1.model)("Review", ReviewSchema);
