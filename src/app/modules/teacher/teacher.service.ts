import mongoose from "mongoose";
import { envVars } from "../../config";
import AppError from "../../helpers/AppError";
import { ITeacher } from "./teacher.interface";
import { TeacherModel } from "./teacher.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { UserModel } from "../user/user.model";
import { DateTime } from "luxon";
import { AvailabilityModel } from "../availability/availability.model";
import { BookingModel } from "../booking/booking.model";
import { StudentModel } from "../student/student.model";

const createTeacher = async (
  payload: Partial<ITeacher> & { timezone?: string },
) => {
  const { email, password, timezone, ...rest } = payload;

  // Duplicate check outside the transaction — read-only, no rollback needed
  const isUserExist = await TeacherModel.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Teacher already exists!");
  }

  // Hash before the transaction — bcrypt is CPU-bound, not a DB operation
  const hashPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const session = await mongoose.startSession();
  let result: { teacher: any; user: any };

  try {
    await session.withTransaction(async () => {
      const [teacher] = await TeacherModel.create(
        [{ email, password: hashPassword, ...rest }],
        { session },
      );

      const [user] = await UserModel.create(
        [
          {
            teacher: teacher._id,
            name: teacher.name,
            email: teacher.email,
            password: hashPassword,
            role: "TEACHER",
            timezone: timezone || "UTC",
          },
        ],
        { session },
      );

      // Link the user back to the teacher record so both sides of the ref are set
      await TeacherModel.findByIdAndUpdate(
        teacher._id,
        { user: user._id },
        { session },
      );

      result = { teacher, user };
    });
  } finally {
    session.endSession();
  }

  return result!;
};

const convertAvailabilitiesToTimezone = (availabilities: any[], tz: string) => {
  const nowUtc = new Date();
  const allSlots: any[] = [];

  for (const avail of availabilities) {
    const obj = avail.toObject ? avail.toObject() : avail;
    for (const slot of obj.slots || []) {
      if (new Date(slot.startTime) >= nowUtc) {
        allSlots.push(slot);
      }
    }
  }

  allSlots.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const grouped: Record<string, { day: string; date: string; slots: any[] }> = {};

  for (const slot of allSlots) {
    const dt = DateTime.fromJSDate(new Date(slot.startTime)).setZone(tz);
    const localDate = dt.toFormat("yyyy-MM-dd");
    const localDay = dt.toFormat("cccc");

    if (!grouped[localDate]) {
      grouped[localDate] = { day: localDay, date: localDate, slots: [] };
    }

    grouped[localDate].slots.push({
      _id: slot._id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: slot.isBooked,
    });
  }

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};

const getAllTeachers = async (viewerTimezone?: string) => {
  const tz = viewerTimezone || "UTC";

  const teachers = await TeacherModel.find()
    .populate("availabilities")
    .populate({
      path: "bookings",
      populate: [
        { path: "teacherId", select: "name email" },
        { path: "studentId", select: "name email" },
      ],
    });

  return teachers.map((teacher) => {
    const obj = teacher.toObject();
    return {
      ...obj,
      availabilities: convertAvailabilitiesToTimezone(
        obj.availabilities || [],
        tz,
      ),
    };
  });
};

const getSingleTeacher = async (teacherId: string, viewerTimezone?: string) => {
  const tz = viewerTimezone || "UTC";

  const teacher = await TeacherModel.findById(teacherId)
    .populate("availabilities")
    .populate("bookings");

  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const obj = teacher.toObject();
  return {
    ...obj,
    availabilities: convertAvailabilitiesToTimezone(
      obj.availabilities || [],
      tz,
    ),
  };
};

const updateTeacher = async (teacherId: string, payload: Partial<ITeacher>) => {
  const teacher = await TeacherModel.findById(teacherId);

  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const updatedTeacher = await TeacherModel.findByIdAndUpdate(
    teacher._id,
    payload,
    { new: true },
  )
    .populate("availabilities")
    .populate("bookings");

  const userUpdate: any = {};
  if (payload.name) userUpdate.name = payload.name;
  if (payload.email) userUpdate.email = payload.email;

  if (Object.keys(userUpdate).length > 0) {
    await UserModel.updateOne({ teacher: teacherId }, { $set: userUpdate });
  }

  return updatedTeacher;
};

const deleteTeacher = async (teacherId: string) => {
  const teacher = await TeacherModel.findById(teacherId);

  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  // 1. Find all bookings for this teacher to clean up student refs
  const teacherBookings = await BookingModel.find({ teacherId, isDeleted: false });
  const bookingIds = teacherBookings.map((b) => b._id);

  // 2. Remove booking refs from all students who booked this teacher
  if (bookingIds.length > 0) {
    await StudentModel.updateMany(
      { booking: { $in: bookingIds } },
      { $pull: { booking: { $in: bookingIds } } },
    );
  }

  // 3. Delete all bookings for this teacher
  await BookingModel.deleteMany({ teacherId });

  // 4. Delete all availability records for this teacher
  await AvailabilityModel.deleteMany({ teacherId });

  // 5. Delete the teacher's user account
  await UserModel.findOneAndDelete({ teacher: teacherId });

  // 6. Delete the teacher
  const deletedTeacher = await TeacherModel.findByIdAndDelete(teacherId);
  return deletedTeacher;
};

export const TeacherServices = {
  createTeacher,
  getAllTeachers,
  getSingleTeacher,
  updateTeacher,
  deleteTeacher,
};