import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DiscountCodeService } from "./discountCode.service";
import { UserModel } from "../user/user.model";
import AppError from "../../helpers/AppError";

// Admin — generate a new code
const generateCode = catchAsync(async (req: Request, res: Response) => {
  const { packageId, discountPercent } = req.body;

  const result = await DiscountCodeService.generateCode(
    packageId,
    discountPercent,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Discount code generated successfully",
    data: result,
  });
});

// Student — validate a code before checkout
const validateCode = catchAsync(async (req: Request, res: Response) => {
  const { code, packageId } = req.body;
  const userId = req.user.userId;

  const user = await UserModel.findById(userId);
  if (!user?.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const result = await DiscountCodeService.validateCode(
    code,
    packageId,
    user.student.toString(),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Discount code is valid",
    data: result,
  });
});

// Admin — get all codes
const getAllCodes = catchAsync(async (req: Request, res: Response) => {
  const result = await DiscountCodeService.getAllCodes();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All discount codes fetched",
    data: result,
  });
});

// Admin — delete a code
const deleteCode = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await DiscountCodeService.deleteCode(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Discount code deleted",
    data: null,
  });
});

export const DiscountCodeController = {
  generateCode,
  validateCode,
  getAllCodes,
  deleteCode,
};