import z from "zod";

export const createHeroZodSchema = z.object({
  badge: z.string({ required_error: "Badge is required" }),
  title: z.string({ required_error: "Title is required" }),
  description: z.string({ required_error: "Description is required" }),
  images: z.array(z.string()).optional(),
  cardTitle: z.string({ required_error: "Card title is required" }),
  cardDescription: z.string({ required_error: "Card description is required" }),
});

export const updateHeroZodSchema = z.object({
  badge: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  cardTitle: z.string().optional(),
  cardDescription: z.string().optional(),
  images: z.array(z.string()).optional(),
});
