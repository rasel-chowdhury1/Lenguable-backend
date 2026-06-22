"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
exports.createStudentSchema = zod_1.z.object({
    name: zod_1.z
        .string({ invalid_type_error: "Name must be string !" })
        .min(2, { message: "Name must be at least 2 characters !" })
        .max(30, { message: "Name can't be more than 30 characters !" })
        .optional(),
    email: zod_1.z
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email formate !" })
        .optional(),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 6 characters long")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
        .optional(),
    profilePicture: zod_1.z.string().optional(),
    aboutMe: zod_1.z.string().optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    payment: zod_1.z.array(zod_1.z.string()).optional(),
    course: zod_1.z.array(zod_1.z.string()).optional(),
    booking: zod_1.z.array(zod_1.z.string()).optional(),
    reviews: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateStudentSchema = zod_1.z.object({
    name: zod_1.z
        .string({ invalid_type_error: "Name must be string !" })
        .min(2, { message: "Name must be at least 2 characters !" })
        .max(30, { message: "Name can't be more than 30 characters !" })
        .optional(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
        .optional(),
    profilePicture: zod_1.z.string().optional(),
    aboutMe: zod_1.z.string().optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    payment: zod_1.z.array(zod_1.z.string()).optional(),
    course: zod_1.z.array(zod_1.z.string()).optional(),
    reviews: zod_1.z.array(zod_1.z.string()).optional(),
});
