import { Types } from "mongoose";

export interface INote {
  studentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  lessonTaught: string;
  activitiesDone: string;
  strengths: string;
  areasToImprove: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}