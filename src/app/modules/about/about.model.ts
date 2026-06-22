import { Schema, model } from "mongoose";
import { IAbout, IStatItem } from "./about.interface";

const StatItemSchema = new Schema<IStatItem>(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false, versionKey: false },
);

const AboutSchema = new Schema<IAbout>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    stats: { type: [StatItemSchema], required: true },
  },
  { timestamps: true, versionKey: false },
);

export const About = model<IAbout>("About", AboutSchema);
