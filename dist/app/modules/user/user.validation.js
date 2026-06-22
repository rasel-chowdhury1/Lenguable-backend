"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createUserZodSchema = zod_1.default.object({
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
    aboutMe: zod_1.default.string().optional(),
    timezone: zod_1.default.string().optional(),
});
