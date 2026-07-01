import { Types } from "mongoose";

export type AuditAction =
  | "add_credit"
  | "remove_credit"
  | "create_teacher"
  | "delete_teacher"
  | "manual_teacher"
  | "manual_payout";

export interface IAdminAuditLog {
  adminId: Types.ObjectId;
  action: AuditAction;
  targetId: Types.ObjectId;
  details: string;
  createdAt?: Date;
  updatedAt?: Date;
}
