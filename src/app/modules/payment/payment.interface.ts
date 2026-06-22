import { Types } from "mongoose";

export type TPaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface IPayment {
  studentId: Types.ObjectId;
  packageId: Types.ObjectId;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  originalPrice: number;
  discountAmount: number;
  amount: number;
  currency: string;
  discountCode?: string | null;
  status: TPaymentStatus;
  paidAt?: Date;
}