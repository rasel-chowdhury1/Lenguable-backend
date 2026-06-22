import { Schema, model } from "mongoose";
import { IStudent } from "./student.interface";
import { Role } from "../user/user.interface";

const studentSchema = new Schema<IStudent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    name: { type: String },

    email: { type: String },

    password: { type: String },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },

    profilePicture: { type: String },

    aboutMe: { type: String },

    interests: {
      type: [String],
      default: [],
    },

    credits: {
      type: Number,
      default: 0,
    },
      totalCompletedClasses: {
      type: Number,
      default: 0,
    },

    payment: {
      type: [Schema.Types.ObjectId],
      ref: "Payment",
      default: [],
    },
    packages: {
      type: [Schema.Types.ObjectId],
      ref: "Package",
      default: [],
    },

    booking: {
      type: [Schema.Types.ObjectId],
      ref: "Booking",
      default: [],
    },

    reviews: {
      type: [Schema.Types.ObjectId],
      ref: "Review",
      default: [],
    },
    unlockedLessons: [
      { type: Schema.Types.ObjectId, ref: "Lesson", default: [] },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const StudentModel = model<IStudent>("Student", studentSchema);
