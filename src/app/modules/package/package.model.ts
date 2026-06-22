import { Schema, model } from "mongoose";
import { IPackage } from "./package.interface";

const PackageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    perClassPrice: {
      type: Number,
      min: 0,
    },
    features: {
      type: [String],
      required: true,
    },
    isMostPopular: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PackageModel = model<IPackage>("Package", PackageSchema);
