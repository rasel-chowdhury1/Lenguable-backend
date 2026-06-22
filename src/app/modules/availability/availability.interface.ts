import { Types } from "mongoose";

export interface ISlot {
  _id?: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  isBooked?: boolean;
}

export interface IAvailability {
  teacherId: Types.ObjectId;
  timezone: string;
  slots: ISlot[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISlotInput {
  startTime: string; // local "HH:mm"
  endTime: string;   // local "HH:mm"
}

export interface IAvailabilityInput {
  date: string;  // local "YYYY-MM-DD"
  slots: ISlotInput[];
}
