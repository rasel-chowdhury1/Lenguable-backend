import { z } from "zod";

export const createCTA2 = z.object({
  title: z.string(),
  description: z.string(),
});

export const updateCTA2 = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});
