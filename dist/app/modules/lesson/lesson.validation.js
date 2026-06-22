"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLessonZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createLessonZodSchema = zod_1.default.object({
    title: zod_1.default
        .string({ invalid_type_error: "Title must be string" })
        .min(2, { message: "Title must be at least 2 characters" })
        .max(100),
    level: zod_1.default.enum(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]),
    // file: z.string(),
    exercises: zod_1.default.array(zod_1.default.string()),
    isLock: zod_1.default.boolean().default(true),
});
