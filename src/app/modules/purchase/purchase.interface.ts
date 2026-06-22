import { Types } from "mongoose";

export interface IPurchase {
  studentId: Types.ObjectId;
  packageId: Types.ObjectId;
  price: number;
  credits: number;
}
