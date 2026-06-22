"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatYouGetValidation = void 0;
const zod_1 = require("zod");
const VALID_ICONS = ["User", "BookOpen", "Calendar", "Award"];
const OfferingSchema = zod_1.z.object({
    icon: zod_1.z.enum(VALID_ICONS, {
        required_error: "Icon is required",
        message: `Icon must be one of: ${VALID_ICONS.join(", ")}`,
    }),
    title: zod_1.z
        .string({ required_error: "Offering title is required" })
        .trim()
        .min(1),
    description: zod_1.z
        .string({ required_error: "Offering description is required" })
        .trim()
        .min(1),
});
const createWhatYouGetSchema = zod_1.z.object({
    sectionTitle: zod_1.z
        .string({ required_error: "Section title is required" })
        .trim()
        .min(1),
    sectionSubtitle: zod_1.z
        .string({ required_error: "Section subtitle is required" })
        .trim()
        .min(1),
    offerings: zod_1.z
        .array(OfferingSchema, { required_error: "Offerings are required" })
        .min(1, "At least one offering is required"),
});
const updateWhatYouGetSchema = zod_1.z.object({
    sectionTitle: zod_1.z.string().trim().min(1).optional(),
    sectionSubtitle: zod_1.z.string().trim().min(1).optional(),
    offerings: zod_1.z.array(OfferingSchema).min(1).optional(),
});
exports.WhatYouGetValidation = {
    createWhatYouGetSchema,
    updateWhatYouGetSchema,
};
