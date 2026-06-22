import { model, Schema } from "mongoose";
import { IUser, Role } from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    aboutMe: { type: String },
    timezone: { type: String, default: "UTC" },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    // availabilities: { type: Schema.Types.ObjectId, ref: "Availability" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel = model<IUser>("User", UserSchema);
