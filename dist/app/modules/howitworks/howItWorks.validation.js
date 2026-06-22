"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HowItWorksValidation = void 0;
const zod_1 = require("zod");
const StepSchema = zod_1.z.object({
    title: zod_1.z.string({ required_error: "Step title is required" }).trim().min(1),
    description: zod_1.z
        .string({ required_error: "Step description is required" })
        .trim()
        .min(1),
});
const createHowItWorksSchema = zod_1.z.object({
    sectionTitle: zod_1.z
        .string({ required_error: "Section title is required" })
        .trim()
        .min(1),
    sectionSubtitle: zod_1.z
        .string({ required_error: "Section subtitle is required" })
        .trim()
        .min(1),
    badge: zod_1.z.object({
        label: zod_1.z
            .string({ required_error: "Badge label is required" })
            .trim()
            .min(1),
        tagline: zod_1.z
            .string({ required_error: "Badge tagline is required" })
            .trim()
            .min(1),
    }),
    steps: zod_1.z
        .array(StepSchema, { required_error: "Steps are required" })
        .min(1, "At least one step is required"),
});
const updateHowItWorksSchema = zod_1.z.object({
    sectionTitle: zod_1.z.string().trim().min(1).optional(),
    sectionSubtitle: zod_1.z.string().trim().min(1).optional(),
    badge: zod_1.z
        .object({
        label: zod_1.z.string().trim().min(1).optional(),
        tagline: zod_1.z.string().trim().min(1).optional(),
    })
        .optional(),
    steps: zod_1.z.array(StepSchema).min(1).optional(),
});
exports.HowItWorksValidation = {
    createHowItWorksSchema,
    updateHowItWorksSchema,
};
