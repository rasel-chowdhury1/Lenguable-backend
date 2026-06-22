import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ReviewService } from "./review.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// Student: create a review
const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

// Student: update own review 
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { reviewId } = req.params;
  const result = await ReviewService.updateReview(userId, reviewId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

// Student: delete own review
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { reviewId } = req.params;
  const result = await ReviewService.deleteReview(userId, reviewId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

// Public: get reviews for a teacher
const getTeacherReviews = catchAsync(async (req: Request, res: Response) => {
  const { teacherId } = req.params;
  const result = await ReviewService.getTeacherReviews(teacherId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher reviews fetched successfully",
    data: result,
  });
});

// Admin: get all reviews
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviews fetched successfully",
    data: result,
  });
});

// Student: get own reviews
const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await ReviewService.getMyReviews(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My reviews fetched successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  updateReview,
  deleteReview,
  getTeacherReviews,
  getAllReviews,
  getMyReviews,
};