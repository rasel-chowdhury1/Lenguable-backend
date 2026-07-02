import { Types } from "mongoose";

export type TeacherEarningType =
  | "class_completed"
  | "class_cancelled"
  | "payout"
  | "admin_adjustment";

export interface ITeacherEarning {
  teacherId: Types.ObjectId;
  type: TeacherEarningType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  bookingId?: Types.ObjectId | null;
  payoutId?: Types.ObjectId | null;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
