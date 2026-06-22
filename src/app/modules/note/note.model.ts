import { Schema, model } from "mongoose";
import { INote } from "./note.interface";

const noteSchema = new Schema<INote>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonTaught: {
      type: String,
      required: true,
      trim: true,
    },
    activitiesDone: {
      type: String,
      required: true,
      trim: true,
    },
    strengths: {
      type: String,
      required: true,
      trim: true,
    },
    areasToImprove: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Note = model<INote>("Note", noteSchema);
