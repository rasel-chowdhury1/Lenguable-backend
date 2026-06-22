import { z } from "zod";

const StepSchema = z.object({
  title: z.string({ required_error: "Step title is required" }).trim().min(1),
  description: z
    .string({ required_error: "Step description is required" })
    .trim()
    .min(1),
});

const createHowItWorksSchema = z.object({
  sectionTitle: z
    .string({ required_error: "Section title is required" })
    .trim()
    .min(1),
  sectionSubtitle: z
    .string({ required_error: "Section subtitle is required" })
    .trim()
    .min(1),
  badge: z.object({
    label: z
      .string({ required_error: "Badge label is required" })
      .trim()
      .min(1),
    tagline: z
      .string({ required_error: "Badge tagline is required" })
      .trim()
      .min(1),
  }),
  steps: z
    .array(StepSchema, { required_error: "Steps are required" })
    .min(1, "At least one step is required"),
});
const updateHowItWorksSchema = z.object({
  sectionTitle: z.string().trim().min(1).optional(),
  sectionSubtitle: z.string().trim().min(1).optional(),
  badge: z
    .object({
      label: z.string().trim().min(1).optional(),
      tagline: z.string().trim().min(1).optional(),
    })
    .optional(),
  steps: z.array(StepSchema).min(1).optional(),
});

export const HowItWorksValidation = {
  createHowItWorksSchema,
  updateHowItWorksSchema,
};
