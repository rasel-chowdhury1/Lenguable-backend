import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { PayoutService } from "./payout.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserModel } from "../user/user.model";
import AppError from "../../helpers/AppError";

// Teacher: start Stripe Connect onboarding
const connectStripe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const result = await PayoutService.createStripeConnectAccount(
    user.teacher.toString(),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe onboarding link generated",
    data: result, // { url }
  });
});

// Teacher: check onboarding status
const checkOnboardingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const result = await PayoutService.checkStripeOnboardingStatus(
    user.teacher.toString(),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Onboarding status fetched",
    data: result,
  });
});

// Teacher: get own payout history
const getMyPayouts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const result = await PayoutService.getMyPayouts(user.teacher.toString());

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payout history fetched",
    data: result,
  });
});

// Admin: get all payouts
const getAllPayouts = catchAsync(async (req: Request, res: Response) => {
  const result = await PayoutService.getAllPayouts();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All payouts fetched",
    data: result,
  });
});

// Admin: manually trigger all payouts
const triggerAllPayouts = catchAsync(async (req: Request, res: Response) => {
  const result = await PayoutService.processAllTeacherPayouts();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payouts processed successfully",
    data: result,
  });
});

export const PayoutController = {
  connectStripe,
  checkOnboardingStatus,
  getMyPayouts,
  getAllPayouts,
  triggerAllPayouts,
};