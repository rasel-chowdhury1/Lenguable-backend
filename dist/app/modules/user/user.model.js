"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    aboutMe: { type: String },
    timezone: { type: String, default: "UTC" },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.STUDENT,
    },
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student" },
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: "Teacher" },
    // availabilities: { type: Schema.Types.ObjectId, ref: "Availability" },
}, {
    timestamps: true,
    versionKey: false,
});
exports.UserModel = (0, mongoose_1.model)("User", UserSchema);
