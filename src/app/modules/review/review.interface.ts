import { Types } from "mongoose";

export interface IReview {
  studentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}