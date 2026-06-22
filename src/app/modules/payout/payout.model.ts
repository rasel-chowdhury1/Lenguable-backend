import { Schema, model } from "mongoose";
import { IPayout } from "./payout.interface";

const PayoutSchema = new Schema<IPayout>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    stripeTransferId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PayoutModel = model<IPayout>("Payout", PayoutSchema);