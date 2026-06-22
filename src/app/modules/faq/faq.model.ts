import { Schema, model } from "mongoose";

const faqSchema = new Schema(
  {
    sectionTitle: {
      type: String,
      required: true,
    },
    sectionSubtitle: {
      type: String,
      required: true,
    },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

export const FAQ = model("FAQ", faqSchema);
