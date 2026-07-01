import { z } from "zod";

const auditActionEnum = z.enum([
  "add_credit",
  "remove_credit",
  "create_teacher",
  "delete_teacher",
  "manual_teacher",
  "manual_payout",
]);

export const createAuditLogZodSchema = z.object({
  targetId: z.string({ required_error: "Target user ID is required" }),
  action: auditActionEnum,
  details: z.string({ required_error: "Details are required" }).min(1),
});
