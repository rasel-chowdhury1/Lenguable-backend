import { Schema, model } from "mongoose";

const SlotSchema = new Schema(
  {
    startTime: {
      type: Date, // UTC
      required: true,
    },

    endTime: {
      type: Date, // UTC
      required: true,
    },

    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  },
);

const AvailabilitySchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },

    timezone: {
      type: String,
      required: true,
    },

    slots: {
      type: [SlotSchema],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AvailabilityModel = model(
  "Availability",
  AvailabilitySchema,
);