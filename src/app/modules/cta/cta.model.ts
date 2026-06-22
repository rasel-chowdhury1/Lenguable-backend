import { Schema, model } from "mongoose";
import { ICTA } from "./cta.interface";

const ctaSchema = new Schema<ICTA>(
  {
    badgeText: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export const CTA = model<ICTA>("CTA", ctaSchema);