import z from "zod";

export const createNoteZodSchema = z.object({
  studentId: z.string({
    required_error: "Student ID is required",
  }),

  teacherId: z.string({
    required_error: "Teacher ID is required",
  }),

  lessonTaught: z
    .string()
    .min(3, "Lesson taught must be at least 3 characters"),

  activitiesDone: z
    .string()
    .min(3, "Activities done must be at least 3 characters"),

  strengths: z.string().min(3, "Strengths must be at least 3 characters"),

  areasToImprove: z
    .string()
    .min(3, "Areas to improve must be at least 3 characters"),

  notes: z.string().optional(),
});
