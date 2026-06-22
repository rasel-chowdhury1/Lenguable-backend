import cron from "node-cron";
import { BookingModel } from "../modules/booking/booking.model";
import { UserModel } from "../modules/user/user.model";
import { sendEmail } from "../utils/sendEmail";
import { envVars } from "../config";
import { formatDateEmail, buildJoinUrl } from "../modules/booking/booking.service";

const formatTimeEmail = (startTime: Date, timezone: string): string => {
  try {
    return new Date(startTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    });
  } catch {
    return new Date(startTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });
  }
};

const formatDate = (startTime: Date): string =>
  new Date(startTime).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const sendReminderEmails = async (timeLabel: "24h" | "2h") => {
  try {
    const now = new Date();
    const [minHours, maxHours] = timeLabel === "24h" ? [23, 25] : [1.5, 2.5];
    const windowStart = new Date(now.getTime() + minHours * 3600 * 1000);
    const windowEnd = new Date(now.getTime() + maxHours * 3600 * 1000);
    const sentField = timeLabel === "24h" ? "reminder24hSent" : "reminder2hSent";

    const bookings = await BookingModel.find({
      status: "scheduled",
      startTime: { $gte: windowStart, $lte: windowEnd },
      [sentField]: null,
    })
      .populate("studentId", "name")
      .populate("teacherId", "name");

    if (!bookings.length) return;

    // Batch fetch all user accounts in 2 queries instead of N+N
    const studentIds = bookings.map((b: any) => b.studentId._id);
    const teacherIds = bookings.map((b: any) => b.teacherId._id);

    const [studentUsers, teacherUsers] = await Promise.all([
      UserModel.find({ student: { $in: studentIds } }).select("student email timezone"),
      UserModel.find({ teacher: { $in: teacherIds } }).select("teacher email timezone"),
    ]);

    const studentMap = new Map(studentUsers.map((u) => [u.student!.toString(), u]));
    const teacherMap = new Map(teacherUsers.map((u) => [u.teacher!.toString(), u]));

    const subjectLabel = timeLabel === "24h" ? "24 Hours" : "2 Hours";
    const timeLabelText = timeLabel === "24h" ? "24 Hours Before" : "2 Hours Before";
    const sentIds: string[] = [];
    const emailTasks: Promise<any>[] = [];

    for (const booking of bookings) {
      const student: any = booking.studentId;
      const teacher: any = booking.teacherId;

      const studentUser = studentMap.get(student._id.toString());
      const teacherUser = teacherMap.get(teacher._id.toString());

      if (!studentUser || !teacherUser) {
        console.log(`❌ Missing user accounts for booking ${booking._id}`);
        continue;
      }

      const classDateTime = new Date(booking.startTime);

      console.log("classDateTime =>> ", classDateTime);
      
      const bookingIdStr = booking._id.toString();
      const sharedData = {
        teacherName: teacher.name,
        studentName: student.name,
        timeLabel: timeLabelText,
        date: formatDate(classDateTime),
      };

      emailTasks.push(
        sendEmail({
          to: studentUser.email,
          subject: `Class Reminder - ${subjectLabel} to go`,
          templateName: "reminder",
          templateData: {
            ...sharedData,
            recipientName: student.name,
            meetLink: buildJoinUrl(bookingIdStr, "student"),
            formattedDate: formatDateEmail(classDateTime, studentUser.timezone || "UTC"),
            formattedTime: formatTimeEmail(classDateTime, studentUser.timezone || "UTC"),
          },
        }),
        sendEmail({
          to: teacherUser.email,
          subject: `Class Reminder - ${subjectLabel} to go`,
          templateName: "reminder",
          templateData: {
            ...sharedData,
            recipientName: teacher.name,
            meetLink: buildJoinUrl(bookingIdStr, "teacher"),
            formattedDate: formatDateEmail(classDateTime, teacherUser.timezone || "UTC"),
            formattedTime: formatTimeEmail(classDateTime, teacherUser.timezone || "UTC"),
          },
        }),
      );

      sentIds.push(booking._id.toString());
    }

    // Send all emails in parallel
    await Promise.allSettled(emailTasks);

    // Bulk-mark reminders as sent in one query
    if (sentIds.length) {
      await BookingModel.updateMany(
        { _id: { $in: sentIds } },
        { $set: { [sentField]: new Date() } },
      );
      console.log(`✅ ${sentIds.length} ${timeLabel} reminders sent`);
    }
  } catch (err) {
    console.error(`❌ sendReminderEmails(${timeLabel}) failed:`, err);
  }
};

const sendReviewRequestEmails = async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const completedBookings = await BookingModel.find({
      status: "completed",
      endTime: { $gte: oneHourAgo, $lte: now },
      reviewRequestSent: { $ne: true },
    })
      .populate("studentId", "name")
      .populate("teacherId", "name");

    if (!completedBookings.length) return;

    // Batch fetch student users in one query
    const studentIds = completedBookings.map((b: any) => b.studentId._id);
    const studentUsers = await UserModel.find({ student: { $in: studentIds } }).select(
      "student email timezone",
    );
    const studentMap = new Map(studentUsers.map((u) => [u.student!.toString(), u]));

    const sentIds: string[] = [];
    const emailTasks: Promise<any>[] = [];
    const reviewLink = `${envVars.FRONTEND_URL}/dashboard/student/booking`;

    for (const booking of completedBookings) {
      const student: any = booking.studentId;
      const teacher: any = booking.teacherId;
      if (!student || !teacher) continue;

      const studentUser = studentMap.get(student._id.toString());
      if (!studentUser) continue;

      const classDateTime = new Date(booking.startTime);

      emailTasks.push(
        sendEmail({
          to: studentUser.email,
          subject: `Leave a Review for ${teacher.name}`,
          templateName: "reviewRequest",
          templateData: {
            studentName: student.name,
            teacherName: teacher.name,
            date: formatDate(classDateTime),
            startTime: formatTimeEmail(classDateTime, studentUser.timezone || "UTC"),
            reviewLink,
          },
        }),
      );

      sentIds.push(booking._id.toString());
    }

    await Promise.allSettled(emailTasks);

    if (sentIds.length) {
      await BookingModel.updateMany(
        { _id: { $in: sentIds } },
        { $set: { reviewRequestSent: true } },
      );
      console.log(`✅ ${sentIds.length} review request(s) sent`);
    }
  } catch (err) {
    console.error("❌ sendReviewRequestEmails failed:", err);
  }
};

export const startReminderCron = () => {
  cron.schedule(
    "* * * * *",
    async () => {
      await Promise.allSettled([
        sendReminderEmails("24h"),
        sendReminderEmails("2h"),
        sendReviewRequestEmails(),
      ]);
    },
    { timezone: "UTC" },
  );

  console.log("✅ Reminder cron scheduled");
};
