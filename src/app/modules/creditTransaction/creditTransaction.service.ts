import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { UserModel } from "../user/user.model";
import { StudentModel } from "../student/student.model";
import { CreditTransactionModel } from "./creditTransaction.model";
import { ICreditTransaction } from "./creditTransaction.interface";

// Internal helper — called by other services (purchase, booking, refund, etc.)
const createCreditTransaction = async (
  payload: Omit<ICreditTransaction, "createdAt" | "updatedAt">,
) => {
  return CreditTransactionModel.create(payload);
};

// Student: get own credit transaction history
const getMyTransactions = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  return CreditTransactionModel.find({ studentId: user.student })
    .populate("bookingId", "startTime endTime status")
    .sort({ createdAt: -1 });
};

// Admin: get all credit transactions
const getAllTransactions = async () => {
  return CreditTransactionModel.find()
    .populate("studentId", "name email")
    .populate("bookingId", "startTime endTime status")
    .sort({ createdAt: -1 });
};

// Admin: get credit transactions for a specific student
const getStudentTransactions = async (studentId: string) => {
  const student = await StudentModel.findById(studentId);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  return CreditTransactionModel.find({ studentId })
    .populate("bookingId", "startTime endTime status")
    .sort({ createdAt: -1 });
};

// Admin: manually add or remove credits and log the transaction
const adminAdjustCredits = async (
  studentId: string,
  credits: number,
  type: "admin_add" | "admin_remove",
  description: string,
) => {
  const student = await StudentModel.findById(studentId);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  if (type === "admin_remove" && (student.credits ?? 0) < credits) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot remove ${credits} credit(s). Student only has ${student.credits ?? 0}.`,
    );
  }

  const balanceBefore = student.credits ?? 0;
  const balanceAfter =
    type === "admin_add" ? balanceBefore + credits : balanceBefore - credits;

  await StudentModel.findByIdAndUpdate(studentId, { credits: balanceAfter });

  return CreditTransactionModel.create({
    studentId,
    type,
    credits,
    balanceBefore,
    balanceAfter,
    bookingId: null,
    description,
  });
};

export const CreditTransactionService = {
  createCreditTransaction,
  getMyTransactions,
  getAllTransactions,
  getStudentTransactions,
  adminAdjustCredits,
};
