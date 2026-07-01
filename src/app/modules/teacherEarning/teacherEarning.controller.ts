import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { TeacherEarningService } from "./teacherEarning.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getMyEarnings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await TeacherEarningService.getMyEarnings(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher earnings retrieved successfully",
    data: result,
  });
});

const getAllEarnings = catchAsync(async (_req: Request, res: Response) => {
  const result = await TeacherEarningService.getAllEarnings();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All teacher earnings retrieved successfully",
    data: result,
  });
});

const getTeacherEarnings = catchAsync(async (req: Request, res: Response) => {
  const { teacherId } = req.params;
  const result = await TeacherEarningService.getTeacherEarnings(teacherId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher earning records retrieved successfully",
    data: result,
  });
});

const adminAdjustEarnings = catchAsync(async (req: Request, res: Response) => {
  const { teacherId, amount, description } = req.body;
  const result = await TeacherEarningService.adminAdjustEarnings(
    teacherId,
    amount,
    description,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Teacher earnings adjusted successfully",
    data: result,
  });
});

export const TeacherEarningController = {
  getMyEarnings,
  getAllEarnings,
  getTeacherEarnings,
  adminAdjustEarnings,
};
