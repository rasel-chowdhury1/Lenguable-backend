import { Schema, model } from "mongoose";

const CTA2Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const CTA2 = model("CTA2", CTA2Schema);
