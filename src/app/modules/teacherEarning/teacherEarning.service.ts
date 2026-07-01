import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { UserModel } from "../user/user.model";
import { TeacherModel } from "../teacher/teacher.model";
import { TeacherEarningModel } from "./teacherEarning.model";
import { ITeacherEarning } from "./teacherEarning.interface";

// Internal helper — called by other services (booking cron, payout, etc.)
const createTeacherEarning = async (
  payload: Omit<ITeacherEarning, "createdAt" | "updatedAt">,
) => {
  return TeacherEarningModel.create(payload);
};

// Teacher: get own earning history
const getMyEarnings = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  return TeacherEarningModel.find({ teacherId: user.teacher })
    .populate("bookingId", "startTime endTime status")
    .populate("payoutId", "amount status paidAt")
    .sort({ createdAt: -1 });
};

// Admin: get all teacher earning records
const getAllEarnings = async () => {
  return TeacherEarningModel.find()
    .populate("teacherId", "name email")
    .populate("bookingId", "startTime endTime status")
    .populate("payoutId", "amount status paidAt")
    .sort({ createdAt: -1 });
};

// Admin: get earning records for a specific teacher
const getTeacherEarnings = async (teacherId: string) => {
  const teacher = await TeacherModel.findById(teacherId);
  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  return TeacherEarningModel.find({ teacherId })
    .populate("bookingId", "startTime endTime status")
    .populate("payoutId", "amount status paidAt")
    .sort({ createdAt: -1 });
};

// Admin: manually adjust a teacher's unpaid earnings and log the record
const adminAdjustEarnings = async (
  teacherId: string,
  amount: number,
  description: string,
) => {
  const teacher = await TeacherModel.findById(teacherId);
  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const balanceBefore = teacher.unpaidEarnings ?? 0;
  const balanceAfter = balanceBefore + amount; // amount can be negative to deduct

  await TeacherModel.findByIdAndUpdate(teacherId, {
    $inc: { unpaidEarnings: amount, totalEarnings: amount > 0 ? amount : 0 },
  });

  return TeacherEarningModel.create({
    teacherId,
    type: "admin_adjustment",
    amount,
    balanceBefore,
    balanceAfter,
    bookingId: null,
    payoutId: null,
    description,
  });
};

export const TeacherEarningService = {
  createTeacherEarning,
  getMyEarnings,
  getAllEarnings,
  getTeacherEarnings,
  adminAdjustEarnings,
};
