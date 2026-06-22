import { Types } from "mongoose";

export type TPayoutStatus = "pending" | "completed" | "failed";

export interface IPayout {
  teacherId: Types.ObjectId;
  amount: number;
  stripeTransferId?: string;
  status: TPayoutStatus;
  paidAt?: Date;
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
