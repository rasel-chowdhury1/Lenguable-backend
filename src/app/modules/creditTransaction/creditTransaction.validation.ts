import { z } from "zod";

export const createCreditTransactionZodSchema = z.object({
  studentId: z.string({ required_error: "Student ID is required" }),
  type: z.enum(["purchase", "booking_deduction", "refund", "admin_add", "admin_remove"], {
    required_error: "Transaction type is required",
  }),
  credits: z.number({ required_error: "Credits amount is required" }),
  balanceBefore: z.number({ required_error: "Balance before is required" }),
  balanceAfter: z.number({ required_error: "Balance after is required" }),
  bookingId: z.string().optional().nullable(),
  description: z.string({ required_error: "Description is required" }).min(1),
});

export const adminAdjustCreditsZodSchema = z.object({
  studentId: z.string({ required_error: "Student ID is required" }),
  credits: z.number({ required_error: "Credits amount is required" }).min(1),
  type: z.enum(["admin_add", "admin_remove"]),
  description: z.string({ required_error: "Description is required" }).min(1),
});
