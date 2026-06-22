import { z } from "zod";

const createCTASchema = z.object({
  badgeText: z.string(),
  title: z.string(),
  description: z.string(),
});

const updateCTASchema = createCTASchema.partial();

export const CTAValidation = {
  createCTASchema,
  updateCTASchema,
};