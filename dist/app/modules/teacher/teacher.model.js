"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherModel = void 0;
const mongoose_1 = require("mongoose");
const teacher_interface_1 = require("./teacher.interface");
const teacherSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    country: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: String,
    nationality: String,
    experience: { type: Number },
    interests: [String],
    languages: [String],
    aboutMe: String,
    status: { type: String, default: teacher_interface_1.Status.ACTIVE },
    availabilities: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Availability" }],
    bookings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Booking" }],
    totalClasses: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalCanceledClasses: { type: Number, default: 0 },
    stripeAccountId: {
        type: String,
        default: null,
    },
    stripeOnboarded: {
        type: Boolean,
        default: false,
    },
    totalPaidOut: {
        type: Number,
        default: 0,
    },
    unpaidEarnings: {
        type: Number,
        default: 0,
    },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    googleAccessToken: { type: String, default: null },
    googleRefreshToken: { type: String, default: null },
    googleTokenExpiry: { type: Number, default: null },
}, { timestamps: true, versionKey: false });
exports.TeacherModel = (0, mongoose_1.model)("Teacher", teacherSchema);
