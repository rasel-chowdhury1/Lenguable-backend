import { Schema, model } from "mongoose";
import { IAvailability } from "./availability.interface";

const SlotSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { _id: true },
);

const AvailabilitySchema = new Schema<IAvailability>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    utcDate:{
      type:Date,
      requred:true
    },
    slots: { type: [SlotSchema], required: true },
  },
  { timestamps: true, versionKey: false },
);

// One availability doc per teacher per date
AvailabilitySchema.index({ teacherId: 1, date: 1 }, { unique: true });

export const AvailabilityModel = model<IAvailability>(
  "PreAvailability",
  AvailabilitySchema,
);
