import { Types } from "mongoose";
import { Role } from "../user/user.interface";

export interface IStudent {
  _id?: Types.ObjectId;
  user?: Types.ObjectId;
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  profilePicture?: string;
  aboutMe?: string;
  interests?: string[];
  credits?: number;
  totalCompletedClasses?: number;
  payment?: Types.ObjectId[];
  packages?: Types.ObjectId[];
  booking?: Types.ObjectId[];
  reviews?: Types.ObjectId[];
  unlockedLessons?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
