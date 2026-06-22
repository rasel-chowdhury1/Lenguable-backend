import { model, Schema } from "mongoose";
import { ITeacher, Status } from "./teacher.interface";

const teacherSchema = new Schema<ITeacher>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    country: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: String,
    nationality: String,
    experience: { type: Number },
    interests: [String],
    languages: [String],
    aboutMe: String,
    status: { type: String, default: Status.ACTIVE },
    availabilities: [{ type: Schema.Types.ObjectId, ref: "Availability" }],
    bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    totalClasses: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalCanceledClasses: { type: Number, default: 0 },
    stripeAccountId: {
      type: String,
      default: null,
    },
    stripeOnboarded: {
      type: Boolean,
      default: false,
    },
    totalPaidOut: {
      type: Number,
      default: 0,
    },
    unpaidEarnings: {
      type: Number,
      default: 0,
    },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    googleAccessToken: { type: String, default: null },
    googleRefreshToken: { type: String, default: null },
    googleTokenExpiry: { type: Number, default: null },
  },
  { timestamps: true, versionKey: false },
);

export const TeacherModel = model<ITeacher>("Teacher", teacherSchema);
