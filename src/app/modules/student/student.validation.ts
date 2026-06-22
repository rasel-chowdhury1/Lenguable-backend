import { z } from "zod";

export const createStudentSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string !" })
    .min(2, { message: "Name must be at least 2 characters !" })
    .max(30, { message: "Name can't be more than 30 characters !" })
    .optional(),
  email: z
    .string({ invalid_type_error: "Email must be string" })
    .email({ message: "Invalid email formate !" })
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 6 characters long")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
    .optional(),
  profilePicture: z.string().optional(),
  aboutMe: z.string().optional(),
  interests: z.array(z.string()).optional(),
  payment: z.array(z.string()).optional(),
  course: z.array(z.string()).optional(),
  booking: z.array(z.string()).optional(),
  reviews: z.array(z.string()).optional(),
});

export const updateStudentSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string !" })
    .min(2, { message: "Name must be at least 2 characters !" })
    .max(30, { message: "Name can't be more than 30 characters !" })
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
    .optional(),
  profilePicture: z.string().optional(),
  aboutMe: z.string().optional(),
  interests: z.array(z.string()).optional(),
  payment: z.array(z.string()).optional(),
  course: z.array(z.string()).optional(),
  reviews: z.array(z.string()).optional(),
});
