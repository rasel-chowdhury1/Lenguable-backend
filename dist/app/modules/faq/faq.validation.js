"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQValidation = void 0;
const zod_1 = require("zod");
const faqItemSchema = zod_1.z.object({
    question: zod_1.z.string(),
    answer: zod_1.z.string(),
});
const createFAQSchema = zod_1.z.object({
    sectionTitle: zod_1.z.string(),
    sectionSubtitle: zod_1.z.string(),
    faqs: zod_1.z.array(faqItemSchema),
});
const updateFAQSchema = createFAQSchema.partial();
exports.FAQValidation = {
    createFAQSchema,
    updateFAQSchema,
};
