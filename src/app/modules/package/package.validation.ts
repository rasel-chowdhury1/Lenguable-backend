import z from "zod";

export const CreatePackageZodSchema = z.object({
  name: z
    .string({ required_error: "Package name is required" })
    .min(2, "Name must be at least 2 characters"),

  price: z
    .number({ required_error: "Price is required" })
    .min(0, "Price must be positive"),

  credits: z
    .number({ required_error: "Credits are required" })
    .min(1, "Credits must be at least 1"),

  perClassPrice: z.number().min(0).optional(),

  features: z.array(z.string()).min(1, "At least one feature is required"),

  isMostPopular: z.boolean().optional(),
  discount: z.number().optional(),
});

export const UpdatePackageZodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),

  price: z.number().min(0, "Price must be positive").optional(),

  credits: z.number().min(1, "Credits must be at least 1").optional(),

  perClassPrice: z
    .number()
    .min(0, "Per class price must be positive")
    .optional(),

  features: z
    .array(z.string())
    .min(1, "At least one feature is required")
    .optional(),

  isMostPopular: z.boolean().optional(),
  discount: z.number().optional(),
});
