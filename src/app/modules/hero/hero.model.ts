import { model, Schema } from "mongoose";
import { IHero } from "./hero.interface";

const heroSchema = new Schema<IHero>(
  {
    badge: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    cardTitle: { type: String, required: true },
    cardDescription: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Hero = model<IHero>("Hero", heroSchema);
