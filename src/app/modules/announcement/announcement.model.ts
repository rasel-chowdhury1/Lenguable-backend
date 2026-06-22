import { Schema, model } from "mongoose";
import { IAnnouncement } from "./announcement.interface";

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AnnouncementModel = model<IAnnouncement>(
  "Announcement",
  AnnouncementSchema,
);
