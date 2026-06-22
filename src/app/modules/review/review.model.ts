import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const ReviewSchema = new Schema<IReview>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// One review per teacher per student
ReviewSchema.index({ studentId: 1, teacherId: 1 }, { unique: true });

export const ReviewModel = model<IReview>("Review", ReviewSchema);