import z from "zod";

export const createUserZodSchema = z.object({
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
  aboutMe: z.string().optional(),
  timezone: z.string().optional(),
});
