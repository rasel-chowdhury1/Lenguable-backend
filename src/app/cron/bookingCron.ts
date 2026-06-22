import cron from "node-cron";
import { BookingModel } from "../modules/booking/booking.model";
import { TeacherModel } from "../modules/teacher/teacher.model";
import { StudentModel } from "../modules/student/student.model";
import { Types } from "mongoose";

// ==============================
// Constants (BEST PRACTICE)
// ==============================
const CLASS_PRICE = 10;

const BOOKING_STATUS = {
  COMPLETED: "completed",
} as const;

const ATTENDANCE_STATUS = {
  ATTENDED: "attended",
  TEACHER_NO_SHOW: "teacherNoShow",
  STUDENT_NO_SHOW: "studentNoShow",
  BOTH_ABSENT: "bothAbsent",
} as const;

// ==============================
// CRON JOB
// ==============================
const runBookingCompletion = async () => {
  try {
    const now = new Date();

    // ==============================
    // Get pending bookings only
    // ==============================
    const bookings = await BookingModel.find({
      status: "scheduled",
      endTime: { $lte: now },
      processedAt: null,
    }).select("_id teacherId studentId teacherJoined studentJoined");

    if (!bookings.length) return;

    // ==============================
    // Bulk arrays
    // ==============================
    const bookingUpdates: any[] = [];
    const teacherUpdates: any[] = [];
    const studentUpdates: any[] = [];

    for (const b of bookings) {
      const processedAt = new Date();

      const teacherJoined = b.teacherJoined;
      const studentJoined = b.studentJoined;

      // =====================================================
      // CASE 1: Both attended
      // =====================================================
      if (teacherJoined && studentJoined) {
        bookingUpdates.push({
          updateOne: {
            filter: { _id: b._id },
            update: {
              $set: {
                status: BOOKING_STATUS.COMPLETED,
                attendanceStatus: ATTENDANCE_STATUS.ATTENDED,
                teacherPaymentEligible: true,
                studentRefunded: false,
                processedAt,
              },
            },
          },
        });

        teacherUpdates.push({
          updateOne: {
            filter: { _id: b.teacherId },
            update: {
              $inc: {
                totalEarnings: CLASS_PRICE,
                unpaidEarnings: CLASS_PRICE,
              },
            },
          },
        });

        continue;
      }

      // =====================================================
      // CASE 2: Student No Show (teacher attended)
      // =====================================================
      if (teacherJoined && !studentJoined) {
        bookingUpdates.push({
          updateOne: {
            filter: { _id: b._id },
            update: {
              $set: {
                status: BOOKING_STATUS.COMPLETED,
                attendanceStatus: ATTENDANCE_STATUS.STUDENT_NO_SHOW,
                teacherPaymentEligible: true,
                studentRefunded: false,
                processedAt,
              },
            },
          },
        });

        teacherUpdates.push({
          updateOne: {
            filter: { _id: b.teacherId },
            update: {
              $inc: {
                totalEarnings: CLASS_PRICE,
                unpaidEarnings: CLASS_PRICE,
              },
            },
          },
        });

        continue;
      }

      // =====================================================
      // CASE 3: Teacher No Show (student attended)
      // =====================================================
      if (!teacherJoined && studentJoined) {
        bookingUpdates.push({
          updateOne: {
            filter: { _id: b._id },
            update: {
              $set: {
                status: BOOKING_STATUS.COMPLETED,
                attendanceStatus: ATTENDANCE_STATUS.TEACHER_NO_SHOW,
                teacherPaymentEligible: false,
                studentRefunded: true,
                processedAt,
              },
            },
          },
        });

        studentUpdates.push({
          updateOne: {
            filter: { _id: b.studentId },
            update: {
              $inc: { credits: 1 },
            },
          },
        });

        continue;
      }

      // =====================================================
      // CASE 4: Both absent
      // =====================================================
      bookingUpdates.push({
        updateOne: {
          filter: { _id: b._id },
          update: {
            $set: {
              status: BOOKING_STATUS.COMPLETED,
              attendanceStatus: ATTENDANCE_STATUS.BOTH_ABSENT,
              teacherPaymentEligible: false,
              studentRefunded: true,
              processedAt,
            },
          },
        },
      });

      studentUpdates.push({
        updateOne: {
          filter: { _id: b.studentId },
          update: {
            $inc: { credits: 1 },
          },
        },
      });
    }

    // ==============================
    // Execute bulk operations
    // ==============================
    if (bookingUpdates.length) {
      await BookingModel.bulkWrite(bookingUpdates);
    }

    if (teacherUpdates.length) {
      await TeacherModel.bulkWrite(teacherUpdates);
    }

    if (studentUpdates.length) {
      await StudentModel.bulkWrite(studentUpdates);
    }

    console.log(
      `✅ Processed: ${bookings.length} bookings | ` +
        `Teachers updated: ${teacherUpdates.length} | ` +
        `Students updated: ${studentUpdates.length}`,
    );
  } catch (error) {
    console.error("❌ Booking cron failed:", error);
  }
};

// ==============================
// CRON SCHEDULER
// ==============================
export const startBookingCron = () => {
  cron.schedule("0 * * * *", runBookingCompletion, {
    timezone: "UTC",
  });

  console.log("✅ Booking cron started (hourly)");
};