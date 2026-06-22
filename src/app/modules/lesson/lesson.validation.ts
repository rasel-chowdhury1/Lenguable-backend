import z from "zod";

export const createLessonZodSchema = z.object({
  title: z
    .string({ invalid_type_error: "Title must be string" })
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100),

  level: z.enum(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]),

  // file: z.string(),

  exercises: z.array(z.string()),

  isLock: z.boolean().default(true),
});
