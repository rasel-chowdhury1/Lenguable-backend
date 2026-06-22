import { Schema, model } from "mongoose";
import { IDiscountCode } from "./discountCode.interface";

const DiscountCodeSchema = new Schema<IDiscountCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

export const DiscountCodeModel = model<IDiscountCode>(
  "DiscountCode",
  DiscountCodeSchema,
);