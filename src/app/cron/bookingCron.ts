import cron from "node-cron";
import { BookingModel } from "../modules/booking/booking.model";
import { TeacherModel } from "../modules/teacher/teacher.model";
import { StudentModel } from "../modules/student/student.model";
import { CreditTransactionModel } from "../modules/creditTransaction/creditTransaction.model";
import { TeacherEarningModel } from "../modules/teacherEarning/teacherEarning.model";

// ==============================
// Constants (BEST PRACTICE)
// ==============================
const CLASS_PRICE = 10;

const BOOKING_STATUS = {
  MISSED: "missed",
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
      isDeleted: false,
      status: "scheduled",
      endTime: { $lte: now },
      processedAt: null,

    }).select("_id teacherId studentId teacherJoined studentJoined");

    if (!bookings.length) return;

    // ==============================
    // Pre-fetch current balances for ledger entries
    // ==============================
    const allStudentIds = [...new Set(bookings.map((b) => b.studentId.toString()))];
    const allTeacherIds = [...new Set(bookings.map((b) => b.teacherId.toString()))];

    const [studentDocs, teacherDocs] = await Promise.all([
      StudentModel.find({ _id: { $in: allStudentIds } }).select("_id credits"),
      TeacherModel.find({ _id: { $in: allTeacherIds } }).select("_id unpaidEarnings"),
    ]);

    // Running balance maps — updated as each booking is processed
    const studentCreditMap = new Map<string, number>(
      studentDocs.map((s) => [s._id.toString(), (s as any).credits ?? 0]),
    );
    const teacherEarningMap = new Map<string, number>(
      teacherDocs.map((t) => [t._id.toString(), (t as any).unpaidEarnings ?? 0]),
    );

    // ==============================
    // Bulk arrays
    // ==============================
    const bookingUpdates: any[] = [];
    const teacherUpdates: any[] = [];
    const studentUpdates: any[] = [];
    const creditTransactionDocs: any[] = [];
    const teacherEarningDocs: any[] = [];

    for (const b of bookings) {
      const processedAt = new Date();

      const teacherJoined = b.teacherJoined;
      const studentJoined = b.studentJoined;

      const teacherKey = b.teacherId.toString();
      const studentKey = b.studentId.toString();

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

        const earningBefore = teacherEarningMap.get(teacherKey) ?? 0;
        const earningAfter = earningBefore + CLASS_PRICE;
        teacherEarningMap.set(teacherKey, earningAfter);
        teacherEarningDocs.push({
          teacherId: b.teacherId,
          type: "class_completed",
          amount: CLASS_PRICE,
          balanceBefore: earningBefore,
          balanceAfter: earningAfter,
          bookingId: b._id,
          description: `Earned $${CLASS_PRICE} — class completed (both attended)`,
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
                status: BOOKING_STATUS.MISSED,
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

        const earningBefore = teacherEarningMap.get(teacherKey) ?? 0;
        const earningAfter = earningBefore + CLASS_PRICE;
        teacherEarningMap.set(teacherKey, earningAfter);
        teacherEarningDocs.push({
          teacherId: b.teacherId,
          type: "class_completed",
          amount: CLASS_PRICE,
          balanceBefore: earningBefore,
          balanceAfter: earningAfter,
          bookingId: b._id,
          description: `Earned $${CLASS_PRICE} — student did not attend`,
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
                status: BOOKING_STATUS.MISSED,
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

        const creditBefore = studentCreditMap.get(studentKey) ?? 0;
        const creditAfter = creditBefore + 1;
        studentCreditMap.set(studentKey, creditAfter);
        creditTransactionDocs.push({
          studentId: b.studentId,
          type: "refund",
          credits: 1,
          balanceBefore: creditBefore,
          balanceAfter: creditAfter,
          bookingId: b._id,
          description: `1 credit refunded — teacher did not attend`,
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
              status: BOOKING_STATUS.MISSED,
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

      const creditBefore = studentCreditMap.get(studentKey) ?? 0;
      const creditAfter = creditBefore + 1;
      studentCreditMap.set(studentKey, creditAfter);
      creditTransactionDocs.push({
        studentId: b.studentId,
        type: "refund",
        credits: 1,
        balanceBefore: creditBefore,
        balanceAfter: creditAfter,
        bookingId: b._id,
        description: `1 credit refunded — both student and teacher absent`,
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

    // ==============================
    // Insert ledger entries in batch
    // ==============================
    if (creditTransactionDocs.length) {
      await CreditTransactionModel.insertMany(creditTransactionDocs, { ordered: false });
    }

    if (teacherEarningDocs.length) {
      await TeacherEarningModel.insertMany(teacherEarningDocs, { ordered: false });
    }

    console.log(
      `✅ Processed: ${bookings.length} bookings | ` +
        `Teachers updated: ${teacherUpdates.length} | ` +
        `Students updated: ${studentUpdates.length} | ` +
        `Credit transactions: ${creditTransactionDocs.length} | ` +
        `Teacher earnings: ${teacherEarningDocs.length}`,
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
