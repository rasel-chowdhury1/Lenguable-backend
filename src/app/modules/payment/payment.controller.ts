import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// GET /payment — admin gets all payments
const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All payments fetched successfully",
    data: result,
  });
});

// GET /payment/my — student gets their own payments
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user.userId;
  const result = await PaymentService.getMyPayments(studentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment history fetched successfully",
    data: result,
  });
});

// GET /payment/session/:sessionId — get single payment by session
const getPaymentBySessionId = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const result = await PaymentService.getPaymentBySessionId(sessionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment fetched successfully",
    data: result,
  });
});

export const PaymentController = {
  getAllPayments,
  getMyPayments,
  getPaymentBySessionId,
};