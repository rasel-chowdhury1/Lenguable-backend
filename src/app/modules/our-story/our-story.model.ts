import { Schema, model } from "mongoose";
import { IOurStory } from "./our-story.interface";

const OurStorySchema = new Schema<IOurStory>(
  {
    sectionTitle: { type: String, required: true, trim: true },
    paragraphs: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: "At least one paragraph is required",
      },
    },
    signature: { type: String, required: true, trim: true },
    founderImage: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

const OurStory = model<IOurStory>("OurStory", OurStorySchema);
export default OurStory;
