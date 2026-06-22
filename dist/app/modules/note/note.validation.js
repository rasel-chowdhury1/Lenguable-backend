"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createNoteZodSchema = zod_1.default.object({
    studentId: zod_1.default.string({
        required_error: "Student ID is required",
    }),
    teacherId: zod_1.default.string({
        required_error: "Teacher ID is required",
    }),
    lessonTaught: zod_1.default
        .string()
        .min(3, "Lesson taught must be at least 3 characters"),
    activitiesDone: zod_1.default
        .string()
        .min(3, "Activities done must be at least 3 characters"),
    strengths: zod_1.default.string().min(3, "Strengths must be at least 3 characters"),
    areasToImprove: zod_1.default
        .string()
        .min(3, "Areas to improve must be at least 3 characters"),
    notes: zod_1.default.string().optional(),
});
