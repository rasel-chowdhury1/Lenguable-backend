import { Schema, model } from "mongoose";
import { IHowItWorks, IStep } from "./howItWorks.interface";

const StepSchema = new Schema<IStep>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false, versionKey: false },
);

const HowItWorksSchema = new Schema<IHowItWorks>(
  {
    sectionTitle: { type: String, required: true, trim: true },
    sectionSubtitle: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    badge: {
      label: { type: String, required: true, trim: true },
      tagline: { type: String, required: true, trim: true },
    },
    steps: { type: [StepSchema], required: true },
  },
  { timestamps: true, versionKey: false },
);

export const HowItWorks = model<IHowItWorks>("HowItWorks", HowItWorksSchema);
