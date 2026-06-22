import { Schema, model } from "mongoose";
import { IPurchase } from "./purchase.interface";

const PurchaseSchema = new Schema<IPurchase>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    credits: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Add indexes
PurchaseSchema.index({ studentId: 1 });
PurchaseSchema.index({ packageId: 1 });
PurchaseSchema.index({ studentId: 1, packageId: 1 });

export const PurchaseModel = model<IPurchase>("Purchase", PurchaseSchema);