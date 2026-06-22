"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OurStoryValidation = void 0;
const zod_1 = require("zod");
const createOurStorySchema = zod_1.z.object({
    sectionTitle: zod_1.z
        .string({ required_error: "Section title is required" })
        .trim()
        .min(1),
    paragraphs: zod_1.z
        .array(zod_1.z.string({ required_error: "Paragraph is required" }).trim().min(1), { required_error: "Paragraphs are required" })
        .min(1, "At least one paragraph is required"),
    signature: zod_1.z
        .string({ required_error: "Signature is required" })
        .trim()
        .min(1),
});
const updateOurStorySchema = zod_1.z.object({
    sectionTitle: zod_1.z.string().trim().min(1).optional(),
    paragraphs: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).optional(),
    signature: zod_1.z.string().trim().min(1).optional(),
});
exports.OurStoryValidation = {
    createOurStorySchema,
    updateOurStorySchema,
};
