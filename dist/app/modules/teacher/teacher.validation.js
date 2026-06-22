"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacherZodSchema = exports.createTeacherZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTeacherZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string !" })
        .min(2, { message: "Name must be at least 2 characters !" })
        .max(30, { message: "Name can't be more than 30 characters !" }),
    email: zod_1.default
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email formate !" }),
    password: zod_1.default
        .string()
        .min(8, "Password must be at least 6 characters long")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character"),
    profilePicture: zod_1.default.string().optional(),
    nationality: zod_1.default.string().optional(),
    country: zod_1.default.string().optional(),
    experience: zod_1.default.string().optional(),
    aboutMe: zod_1.default.string().optional(),
    interests: zod_1.default.array(zod_1.default.string()).optional(),
    languages: zod_1.default.array(zod_1.default.string()).optional(),
    availabilities: zod_1.default.array(zod_1.default.string()).optional(),
    bookings: zod_1.default.array(zod_1.default.string()).optional(),
    totalClasses: zod_1.default.number().int().min(0).optional(),
    totalEarnings: zod_1.default.number().min(0).optional(),
    cancellationsWithin24Hours: zod_1.default.number().int().min(0).optional(),
    isApproved: zod_1.default.boolean().optional(),
    timezone: zod_1.default.string().optional(),
});
exports.updateTeacherZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string!" })
        .min(2, { message: "Name must be at least 2 characters!" })
        .max(30, { message: "Name can't be more than 30 characters!" })
        .optional(),
    country: zod_1.default.string().optional(),
    nationality: zod_1.default.string().optional(),
    experience: zod_1.default.number().int().min(0, { message: "Experience must be a positive number!" }).optional(),
    interests: zod_1.default.array(zod_1.default.string()).optional(),
    aboutMe: zod_1.default
        .string()
        .max(500, { message: "About me can't be more than 500 characters!" })
        .optional(),
    languages: zod_1.default.array(zod_1.default.string()).optional(),
    profilePicture: zod_1.default.string().optional(),
    timezone: zod_1.default.string().optional(),
});
