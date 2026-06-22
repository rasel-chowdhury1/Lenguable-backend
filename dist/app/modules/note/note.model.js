"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = require("mongoose");
const noteSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    lessonTaught: {
        type: String,
        required: true,
        trim: true,
    },
    activitiesDone: {
        type: String,
        required: true,
        trim: true,
    },
    strengths: {
        type: String,
        required: true,
        trim: true,
    },
    areasToImprove: {
        type: String,
        required: true,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Note = (0, mongoose_1.model)("Note", noteSchema);
