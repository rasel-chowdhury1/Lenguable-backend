import { BookingModel } from "../booking/booking.model";
import { UserModel } from "../user/user.model";
import { sendEmail } from "../../utils/sendEmail";
import { buildJoinUrl } from "../booking/booking.service";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";

const sendReminderEmails = async (timeLabel: "24h" | "2h") => {
  // Get all scheduled bookings
  const bookings = await BookingModel.find({ isDeleted: false, status: "scheduled" });

  if (!bookings.length) {
    throw new AppError(httpStatus.NOT_FOUND, "No scheduled bookings found");
  }

  let sentCount = 0;

  for (const booking of bookings) {
    const classDateTime = new Date(booking.startTime);
    const now = new Date();
    const diffMs = classDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (timeLabel === "24h" && (diffHours < 23 || diffHours > 25)) continue;
    if (timeLabel === "2h" && (diffHours < 1 || diffHours > 3)) continue;

    const [student, teacher] = await Promise.all([
      UserModel.findById(booking.studentId),
      UserModel.findById(booking.teacherId),
    ]);

    if (!student || !teacher) continue;

    const bookingIdStr = booking._id.toString();
    const sharedData = {
      date: classDateTime.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
      startTime: classDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }),
      teacherName: teacher.name,
      studentName: student.name,
      timeLabel: timeLabel === "24h" ? "24 Hours Before" : "2 Hours Before",
    };

    // Send to student
    await sendEmail({
      to: student.email,
      subject: `Class Reminder - ${timeLabel} before your class`,
      templateName: "reminder",
      templateData: { ...sharedData, recipientName: student.name, meetLink: buildJoinUrl(bookingIdStr, "student") },
    });

    // Send to teacher
    await sendEmail({
      to: teacher.email,
      subject: `Class Reminder - ${timeLabel} before your class`,
      templateName: "reminder",
      templateData: { ...sharedData, recipientName: teacher.name, meetLink: buildJoinUrl(bookingIdStr, "teacher") },
    });

    sentCount++;
  }

  return { sentCount };
};

export const ReminderService = { sendReminderEmails };