import z from "zod";

export const createResourceZodSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  url: z.string({ required_error: "URL is required" }),
  type: z.string({ required_error: "Type is required" }),
});
