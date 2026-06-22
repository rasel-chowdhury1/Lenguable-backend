"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = void 0;
const mongoose_1 = require("mongoose");
const BookingSchema = new mongoose_1.Schema({
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
    startTime: { type: Date, required: true }, // UTC
    endTime: { type: Date, required: true }, // UTC
    meetLink: { type: String, required: true },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled", "cancelledByStudent"],
        default: "scheduled",
    },
    cancellationReason: { type: String, default: null },
    cancelledBy: {
        type: String,
        enum: ["student", "teacher"],
        default: null,
    },
    teacherJoined: { type: Boolean, default: false },
    studentJoined: { type: Boolean, default: false },
    reminder24hSent: { type: Boolean, default: false },
    reminder2hSent: { type: Boolean, default: false },
    reviewRequestSent: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});
exports.BookingModel = (0, mongoose_1.model)("Booking", BookingSchema);
