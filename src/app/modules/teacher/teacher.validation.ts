import z from "zod";

export const createTeacherZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string !" })
    .min(2, { message: "Name must be at least 2 characters !" })
    .max(30, { message: "Name can't be more than 30 characters !" }),
  email: z
    .string({ invalid_type_error: "Email must be string" })
    .email({ message: "Invalid email formate !" }),
  password: z
    .string()
    .min(8, "Password must be at least 6 characters long")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(
      /[@$!%*?&#]/,
      "Password must contain at least one special character",
    ),
  profilePicture: z.string().optional(),
  nationality: z.string().optional(),
  country: z.string().optional(),
  experience: z.string().optional(),
  aboutMe: z.string().optional(),
  interests: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  availabilities: z.array(z.string()).optional(),
  bookings: z.array(z.string()).optional(),
  totalClasses: z.number().int().min(0).optional(),
  totalEarnings: z.number().min(0).optional(),
  cancellationsWithin24Hours: z.number().int().min(0).optional(),
  isApproved: z.boolean().optional(),
  timezone: z.string().optional(),
});

export const updateTeacherZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string!" })
    .min(2, { message: "Name must be at least 2 characters!" })
    .max(30, { message: "Name can't be more than 30 characters!" })
    .optional(),
  country: z.string().optional(),
  nationality: z.string().optional(),
  experience: z.number().int().min(0, { message: "Experience must be a positive number!" }).optional(),
  interests: z.array(z.string()).optional(),
  aboutMe: z
    .string()
    .max(500, { message: "About me can't be more than 500 characters!" })
    .optional(),
  languages: z.array(z.string()).optional(),
  profilePicture: z.string().optional(),
  timezone: z.string().optional(),
});