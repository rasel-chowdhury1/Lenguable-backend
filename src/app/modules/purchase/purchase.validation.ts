import z from "zod";

export const CreatePurchaseZodSchema = z.object({
  packageId: z.string({
    required_error: "Package ID is required",
  }),
});
