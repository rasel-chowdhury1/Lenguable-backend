"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutValidation = void 0;
const zod_1 = require("zod");
const StatItemSchema = zod_1.z.object({
    value: zod_1.z.string({ required_error: "Stat value is required" }).trim().min(1),
    label: zod_1.z.string({ required_error: "Stat label is required" }).trim().min(1),
    description: zod_1.z
        .string({ required_error: "Stat description is required" })
        .trim()
        .min(1),
});
const createAboutSchema = zod_1.z.object({
    title: zod_1.z
        .string({ required_error: "Title is required" })
        .trim()
        .min(1),
    description: zod_1.z
        .string({ required_error: "Description is required" })
        .trim()
        .min(1),
    stats: zod_1.z
        .array(StatItemSchema, { required_error: "Stats are required" })
        .min(1, "At least one stat is required"),
});
const updateAboutSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).optional(),
    description: zod_1.z.string().trim().min(1).optional(),
    stats: zod_1.z.array(StatItemSchema).min(1).optional(),
});
exports.AboutValidation = {
    createAboutSchema,
    updateAboutSchema,
};
