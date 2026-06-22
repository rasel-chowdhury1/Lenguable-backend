import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await BookingService.createBooking(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const timezone = req.query.timezone as string | undefined;
  const result = await BookingService.getMyBookings(userId, timezone);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { bookingId } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Cancellation reason is required",
      data: null,
    });
  }

  const result = await BookingService.cancelBooking(userId, bookingId, reason);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: {
      refunded: result.refunded,
      cancelledBy: result.cancelledBy,
    },
  });
});

const markTeacherJoined = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { bookingId } = req.params;
  const result = await BookingService.markTeacherJoined(userId, bookingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Teacher attendance marked",
    data: result,
  });
});

const markStudentJoined = catchAsync(async (req: Request, res: Response) => {
  console.log("HIT markStudentJoined controller, bookingId:", req.params.bookingId, "userId:", req.user.userId);
  const result = await BookingService.markStudentJoined(
    req.user.userId,
    req.params.bookingId,
  );
  console.log("Service result:", result);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Joined successfully",
    data: result,
  });
});

const joinViaLink = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const token = req.query.token as string;

  if (!token) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Missing join token",
      data: null,
    });
  }

  const meetLink = await BookingService.joinViaLink(bookingId, token);
  res.redirect(meetLink);
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookings();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All bookings retrieved successfully",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  cancelBooking,
  markTeacherJoined,
  markStudentJoined,
  joinViaLink,
  getAllBookings,
};
