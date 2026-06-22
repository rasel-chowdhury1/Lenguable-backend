import { Types } from "mongoose";

export interface IDiscountCode {
  code: string;
  discountPercent: number;
  packageId: Types.ObjectId;
  usedBy: Types.ObjectId[];
  usedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}