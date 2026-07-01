import { Schema, model } from "mongoose";
import { ICreditTransaction } from "./creditTransaction.interface";

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    type: {
      type: String,
      enum: ["purchase", "booking_deduction", "refund", "admin_add", "admin_remove"],
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

CreditTransactionSchema.index({ studentId: 1, createdAt: -1 });
CreditTransactionSchema.index({ type: 1 });

export const CreditTransactionModel = model<ICreditTransaction>(
  "CreditTransaction",
  CreditTransactionSchema,
);
