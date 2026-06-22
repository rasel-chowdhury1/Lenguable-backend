import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  aboutMe?: string;
  timezone?: string;
  role: Role;
  student?: Types.ObjectId;
  teacher?: Types.ObjectId;
  availabilities?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
