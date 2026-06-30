import { Schema, model } from "mongoose";
import { IBooking } from "./booking.interface";

const BookingSchema = new Schema<IBooking>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    // Meeting Information
    startTime: {
      type: Date,
      required: true,
    }, // UTC

    endTime: {
      type: Date,
      required: true,
    }, // UTC

    meetLink: {
      type: String,
      required: true,
    },

    calendarEventId: {
      type: String,
      default: null,
    },

    // Booking Lifecycle
    status: {
      type: String,
      enum: [
        "scheduled",
        "inProgress",
        "missed",
        "completed",
        "cancelled",
        "cancelledByStudent",
      ],
      default: "scheduled",
    },

    // Attendance Result
    attendanceStatus: {
      type: String,
      enum: [
        "attended",
        "teacherNoShow",
        "studentNoShow",
        "bothAbsent",
      ],
      default: null,
    },

    // Cancellation Information
    cancellationReason: {
      type: String,
      default: null,
    },

    cancelledBy: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // Teacher Attendance
    teacherJoined: {
      type: Boolean,
      default: false,
    },

    teacherFirstJoinedAt: {
      type: Date,
      default: null,
    },

    teacherLastJoinedAt: {
      type: Date,
      default: null,
    },

    // Student Attendance
    studentJoined: {
      type: Boolean,
      default: false,
    },

    studentFirstJoinedAt: {
      type: Date,
      default: null,
    },

    studentLastJoinedAt: {
      type: Date,
      default: null,
    },

    // Financial Processing
    teacherPaymentEligible: {
      type: Boolean,
      default: false,
    },

    studentRefunded: {
      type: Boolean,
      default: false,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    // Notification Tracking
    reminder24hSent: {
      type: Date,
      default: null,
    },

    reminder2hSent: {
      type: Date,
      default: null,
    },

    reviewRequestSent: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Useful Indexes
BookingSchema.index({ teacherId: 1, startTime: 1 });
BookingSchema.index({ studentId: 1, startTime: 1 });
BookingSchema.index({ status: 1, endTime: 1 });
BookingSchema.index({ attendanceStatus: 1 });

export const BookingModel = model<IBooking>("Booking", BookingSchema);