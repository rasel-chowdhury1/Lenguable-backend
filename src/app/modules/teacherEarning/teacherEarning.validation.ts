import { z } from "zod";

export const createTeacherEarningZodSchema = z.object({
  teacherId: z.string({ required_error: "Teacher ID is required" }),
  type: z.enum(["class_completed", "payout", "admin_adjustment"], {
    required_error: "Earning type is required",
  }),
  amount: z.number({ required_error: "Amount is required" }),
  balanceBefore: z.number({ required_error: "Balance before is required" }),
  balanceAfter: z.number({ required_error: "Balance after is required" }),
  bookingId: z.string().optional().nullable(),
  payoutId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const adminAdjustEarningsZodSchema = z.object({
  teacherId: z.string({ required_error: "Teacher ID is required" }),
  amount: z.number({ required_error: "Amount is required" }).min(0.01),
  type: z.literal("admin_adjustment"),
  description: z.string({ required_error: "Description is required" }).min(1),
});
