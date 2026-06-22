import mongoose from "mongoose";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { StudentModel } from "./student.model";
import { IStudent } from "./student.interface";
import { envVars } from "../../config";
import bcrypt from "bcryptjs";
import { UserModel } from "../user/user.model";

const createStudent = async (
  payload: Partial<IStudent> & { timezone?: string },
) => {
  const { email, password, timezone, ...rest } = payload;

  // Duplicate check outside the transaction — read-only, no rollback needed
  const isUserExist = await StudentModel.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Student already exist !");
  }

  // Hash before the transaction — bcrypt is CPU-bound, not a DB operation
  const hashPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const session = await mongoose.startSession();
  let createdUser: any;

  try {
    await session.withTransaction(async () => {
      const [student] = await StudentModel.create(
        [{ email, password: hashPassword, ...rest }],
        { session },
      );

      const [user] = await UserModel.create(
        [
          {
            student: student._id,
            name: student.name,
            email: student.email,
            password: hashPassword,
            role: "STUDENT",
            timezone: timezone || "UTC",
          },
        ],
        { session },
      );

      // Link the user back to the student record so both sides of the ref are set
      await StudentModel.findByIdAndUpdate(
        student._id,
        { user: user._id },
        { session },
      );

      createdUser = user;
    });
  } finally {
    session.endSession();
  }

  return createdUser;
};

const getAllStudents = async () => {
  const students = await StudentModel.find()
    .populate("user", "-password")
    .populate({
      path: "payment",
      populate: {path: "packageId"}
    })
    .populate({
      path: "booking",
      populate: { path: "teacherId", select: "name email" },
    })
    .populate("unlockedLessons");

  return students;
};

const getSingleStudent = async (studentId: string) => {
  const student = await StudentModel.findById(studentId).populate(
    "user",
    "-password",
  );

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  return student;
};


const updateStudent = async (studentId: string, payload: any) => {
  const student = await StudentModel.findById(studentId);

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const updatedStudent = await StudentModel.findByIdAndUpdate(
    student._id,
    payload,
    { new: true },
  ).populate("user", "-password");

  // Sync name and email to UserModel if they were updated
  const userUpdate: any = {};
  if (payload.name) userUpdate.name = payload.name;
  if (payload.email) userUpdate.email = payload.email;

  if (Object.keys(userUpdate).length > 0) {
    await UserModel.updateOne({ student: studentId }, { $set: userUpdate });
  }

  return updatedStudent;
};


const deleteStudent = async (studentId: string) => {
  const student = await StudentModel.findById(studentId);

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  await StudentModel.findByIdAndDelete(studentId);
  await UserModel.deleteOne({ student: studentId }); // add this

  return { message: "Student deleted successfully" };
};

const addCredits = async (studentId: string, credits: number) => {
  const student = await StudentModel.findById(studentId);

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  if (!credits || credits < 1) {
    throw new AppError(httpStatus.BAD_REQUEST, "Credits must be at least 1");
  }

  const updatedStudent = await StudentModel.findByIdAndUpdate(
    studentId,
    { $inc: { credits } },
    { new: true },
  );

  return updatedStudent;
};

const removeCredits = async (studentId: string, credits: number) => {
  const student = await StudentModel.findById(studentId);

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  if (!credits || credits < 1) {
    throw new AppError(httpStatus.BAD_REQUEST, "Credits must be at least 1");
  }

  if ((student.credits ?? 0) < credits) {
    throw new AppError(httpStatus.BAD_REQUEST, "Student does not have enough credits");
  }

  const updatedStudent = await StudentModel.findByIdAndUpdate(
    studentId,
    { $inc: { credits: -credits } },
    { new: true },
  );

  return updatedStudent;
};

export const StudentServices = {
  createStudent,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
  addCredits,
  removeCredits,
};
