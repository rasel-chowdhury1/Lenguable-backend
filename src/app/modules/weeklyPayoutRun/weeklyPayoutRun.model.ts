import { Schema, model } from "mongoose";
import { IWeeklyPayoutRun } from "./weeklyPayoutRun.interface";

const WeeklyPayoutRunSchema = new Schema<IWeeklyPayoutRun>(
  {
    weekStart:     { type: Date,   required: true, unique: true },
    weekEnd:       { type: Date,   required: true },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    totalTeachers: { type: Number, default: 0 },
    successful:    { type: Number, default: 0 },
    failed:        { type: Number, default: 0 },
    startedAt:     { type: Date,   required: true },
    completedAt:   { type: Date,   default: null },
  },
  { timestamps: true, versionKey: false },
);

export const WeeklyPayoutRunModel = model<IWeeklyPayoutRun>(
  "WeeklyPayoutRun",
  WeeklyPayoutRunSchema,
);
