import { z } from "zod";

const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const createFAQSchema = z.object({
  sectionTitle: z.string(),
  sectionSubtitle: z.string(),
  faqs: z.array(faqItemSchema),
});

const updateFAQSchema = createFAQSchema.partial();

export const FAQValidation = {
  createFAQSchema,
  updateFAQSchema,
};