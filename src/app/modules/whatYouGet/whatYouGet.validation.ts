import { z } from "zod";

const VALID_ICONS = ["User", "BookOpen", "Calendar", "Award"] as const;

const OfferingSchema = z.object({
  icon: z.enum(VALID_ICONS, {
    required_error: "Icon is required",
    message: `Icon must be one of: ${VALID_ICONS.join(", ")}`,
  }),
  title: z
    .string({ required_error: "Offering title is required" })
    .trim()
    .min(1),
  description: z
    .string({ required_error: "Offering description is required" })
    .trim()
    .min(1),
});

const createWhatYouGetSchema = z.object({
  sectionTitle: z
    .string({ required_error: "Section title is required" })
    .trim()
    .min(1),
  sectionSubtitle: z
    .string({ required_error: "Section subtitle is required" })
    .trim()
    .min(1),
  offerings: z
    .array(OfferingSchema, { required_error: "Offerings are required" })
    .min(1, "At least one offering is required"),
});

const updateWhatYouGetSchema = z.object({
  sectionTitle: z.string().trim().min(1).optional(),
  sectionSubtitle: z.string().trim().min(1).optional(),
  offerings: z.array(OfferingSchema).min(1).optional(),
});

export const WhatYouGetValidation = {
  createWhatYouGetSchema,
  updateWhatYouGetSchema,
};
