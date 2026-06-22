import { Types } from "mongoose";

export enum Status {
  ACTIVE = "ACTIVE",
  WARNING = "WARNING",
}

export interface ITeacher {
  user?: Types.ObjectId;
  country?: string;
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  nationality?: string;
  experience?: number;
  aboutMe?: string;
  interests?: string[];
  languages?: string[];
  status?: Status;
  availabilities?: Types.ObjectId[];
  bookings?: Types.ObjectId[];
  totalClasses?: number;
  totalEarnings?: number;
  totalCanceledClasses?: number;
  averageRating?: number;
  totalReviews?: number;
  stripeAccountId?: string;
  stripeOnboarded?: boolean;
  totalPaidOut?: number;
  unpaidEarnings?: number;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiry?: number;
}
