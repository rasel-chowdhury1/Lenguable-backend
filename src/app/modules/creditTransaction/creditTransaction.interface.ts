import { Types } from "mongoose";

export type CreditTransactionType =
  | "purchase"
  | "booking_deduction"
  | "refund"
  | "admin_add"
  | "admin_remove";

export interface ICreditTransaction {
  studentId: Types.ObjectId;
  type: CreditTransactionType;
  credits: number;
  balanceBefore: number;
  balanceAfter: number;
  bookingId?: Types.ObjectId | null;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}
