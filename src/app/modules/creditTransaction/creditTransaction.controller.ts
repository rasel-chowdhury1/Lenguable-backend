import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { CreditTransactionService } from "./creditTransaction.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await CreditTransactionService.getMyTransactions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Credit transactions retrieved successfully",
    data: result,
  });
});

const getAllTransactions = catchAsync(async (_req: Request, res: Response) => {
  const result = await CreditTransactionService.getAllTransactions();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All credit transactions retrieved successfully",
    data: result,
  });
});

const getStudentTransactions = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const result = await CreditTransactionService.getStudentTransactions(studentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student credit transactions retrieved successfully",
    data: result,
  });
});

const adminAdjustCredits = catchAsync(async (req: Request, res: Response) => {
  const { studentId, credits, type, description } = req.body;
  const result = await CreditTransactionService.adminAdjustCredits(
    studentId,
    credits,
    type,
    description,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Credits ${type === "admin_add" ? "added" : "removed"} successfully`,
    data: result,
  });
});

export const CreditTransactionController = {
  getMyTransactions,
  getAllTransactions,
  getStudentTransactions,
  adminAdjustCredits,
};
