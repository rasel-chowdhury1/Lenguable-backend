import { Types } from "mongoose";

export interface ISlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface IAvailability {
  teacherId: Types.ObjectId;
  day: string;
  utcDate:Date
  date: string;
  slots: ISlot[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAvailabilityInput {
  day: string;
  date: string;
  slots: ISlot[];
}
