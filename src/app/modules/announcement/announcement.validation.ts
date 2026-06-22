import z from "zod";

export const CreateAnnouncementZodSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(2, "Title must be at least 2 characters"),

  text: z
    .string({ required_error: "Announcement text is required" })
    .min(5, "Text must be at least 5 characters"),

  isEnabled: z.boolean().optional(),
});

export const UpdateAnnouncementZodSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").optional(),

  text: z.string().min(5, "Text must be at least 5 characters").optional(),

  isEnabled: z.boolean().optional(),
});
