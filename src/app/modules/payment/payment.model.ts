import { Schema, model } from "mongoose";
import { IPayment } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    discountCode: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PaymentModel = model<IPayment>("Payment", PaymentSchema);