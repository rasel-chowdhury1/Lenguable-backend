"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAnnouncementZodSchema = exports.CreateAnnouncementZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateAnnouncementZodSchema = zod_1.default.object({
    title: zod_1.default
        .string({ required_error: "Title is required" })
        .min(2, "Title must be at least 2 characters"),
    text: zod_1.default
        .string({ required_error: "Announcement text is required" })
        .min(5, "Text must be at least 5 characters"),
    isEnabled: zod_1.default.boolean().optional(),
});
exports.UpdateAnnouncementZodSchema = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters").optional(),
    text: zod_1.default.string().min(5, "Text must be at least 5 characters").optional(),
    isEnabled: zod_1.default.boolean().optional(),
});
