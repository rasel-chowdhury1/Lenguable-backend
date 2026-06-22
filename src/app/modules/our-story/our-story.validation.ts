import { z } from "zod";

const createOurStorySchema = z.object({
  sectionTitle: z
    .string({ required_error: "Section title is required" })
    .trim()
    .min(1),
  paragraphs: z
    .array(
      z.string({ required_error: "Paragraph is required" }).trim().min(1),
      { required_error: "Paragraphs are required" },
    )
    .min(1, "At least one paragraph is required"),
  signature: z
    .string({ required_error: "Signature is required" })
    .trim()
    .min(1),
});

const updateOurStorySchema = z.object({
  sectionTitle: z.string().trim().min(1).optional(),
  paragraphs: z.array(z.string().trim().min(1)).min(1).optional(),
  signature: z.string().trim().min(1).optional(),
});

export const OurStoryValidation = {
  createOurStorySchema,
  updateOurStorySchema,
};
