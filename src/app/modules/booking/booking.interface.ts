import { Types } from "mongoose";

export type BookingStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "cancelledByStudent";

export type AttendanceStatus =
  | "attended"
  | "teacherNoShow"
  | "studentNoShow"
  | "bothAbsent";

export interface IBooking {
  studentId: Types.ObjectId;
  teacherId: Types.ObjectId;

  // Meeting Info
  startTime: Date; // UTC
  endTime: Date; // UTC
  meetLink: string;
  calendarEventId?: string | null;

  // Booking Lifecycle
  status: BookingStatus;

  // Attendance Result
  attendanceStatus?: AttendanceStatus | null;

  // Cancellation
  cancellationReason?: string | null;
  cancelledBy?: "student" | "teacher" | "admin" | null;
  cancelledAt?: Date | null;

  // Teacher Attendance
  teacherJoined: boolean;
  teacherFirstJoinedAt?: Date | null;
  teacherLastJoinedAt?: Date | null;

  // Student Attendance
  studentJoined: boolean;
  studentFirstJoinedAt?: Date | null;
  studentLastJoinedAt?: Date | null;

  // Financial Processing
  teacherPaymentEligible: boolean;
  studentRefunded: boolean;
  processedAt?: Date | null;

  // Notifications
  reminder24hSent: Date | null;
  reminder2hSent: Date | null;
  reviewRequestSent: boolean;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}