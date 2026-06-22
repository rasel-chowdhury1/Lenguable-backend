import { Schema, model } from "mongoose";
import { ILesson } from "./lesson.interface";

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["A0", "A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
    },
    file: {
      type: String,
    },
    exercises: {
      type: [String],
    },
    isLock: {
      type: Boolean,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const LessonModel = model<ILesson>("Lesson", lessonSchema);
