"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentModel = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("../user/user.interface");
const studentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.STUDENT,
    },
    profilePicture: { type: String },
    aboutMe: { type: String },
    interests: {
        type: [String],
        default: [],
    },
    credits: {
        type: Number,
        default: 0,
    },
    totalCompletedClasses: {
        type: Number,
        default: 0,
    },
    payment: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Payment",
        default: [],
    },
    packages: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Package",
        default: [],
    },
    booking: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Booking",
        default: [],
    },
    reviews: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Review",
        default: [],
    },
    unlockedLessons: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "Lesson", default: [] },
    ],
}, {
    timestamps: true,
    versionKey: false,
});
exports.StudentModel = (0, mongoose_1.model)("Student", studentSchema);
