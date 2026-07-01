import { Schema, model } from "mongoose";
import { ITeacherEarning } from "./teacherEarning.interface";

const TeacherEarningSchema = new Schema<ITeacherEarning>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    type: {
      type: String,
      enum: ["class_completed", "payout", "admin_adjustment"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    payoutId: {
      type: Schema.Types.ObjectId,
      ref: "Payout",
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TeacherEarningSchema.index({ teacherId: 1, createdAt: -1 });
TeacherEarningSchema.index({ type: 1 });
TeacherEarningSchema.index({ bookingId: 1 });
TeacherEarningSchema.index({ payoutId: 1 });

export const TeacherEarningModel = model<ITeacherEarning>(
  "TeacherEarning",
  TeacherEarningSchema,
);
