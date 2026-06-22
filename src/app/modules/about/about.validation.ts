import { z } from "zod";

const StatItemSchema = z.object({
  value: z.string({ required_error: "Stat value is required" }).trim().min(1),
  label: z.string({ required_error: "Stat label is required" }).trim().min(1),
  description: z
    .string({ required_error: "Stat description is required" })
    .trim()
    .min(1),
});

const createAboutSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(1),
  stats: z
    .array(StatItemSchema, { required_error: "Stats are required" })
    .min(1, "At least one stat is required"),
});

const updateAboutSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  stats: z.array(StatItemSchema).min(1).optional(),
});

export const AboutValidation = {
  createAboutSchema,
  updateAboutSchema,
};