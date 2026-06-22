import { ReviewModel } from "./review.model";
import { BookingModel } from "../booking/booking.model";
import { StudentModel } from "../student/student.model";
import { TeacherModel } from "../teacher/teacher.model";
import { UserModel } from "../user/user.model";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";

// Create a review
const createReview = async (
  userId: string,
  payload: { teacherId: string; rating: number; comment: string },
) => {
  const { teacherId, rating, comment } = payload;

  // Get student
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const student = await StudentModel.findById(user.student);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Check teacher exists
  const teacher = await TeacherModel.findById(teacherId);
  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  // Check student has at least one completed booking with this teacher
  const completedBooking = await BookingModel.findOne({
    studentId: student._id,
    teacherId,
    status: "completed",
  });

  if (!completedBooking) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review a teacher after completing a class with them",
    );
  }

  // Check if already reviewed this teacher
  const existingReview = await ReviewModel.findOne({
    studentId: student._id,
    teacherId,
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this teacher",
    );
  }

  // Create review
  const review = await ReviewModel.create({
    studentId: student._id,
    teacherId,
    rating,
    comment,
  });

  // Push review to student
  await StudentModel.findByIdAndUpdate(student._id, {
    $push: { reviews: review._id },
  });

  // Update teacher average rating
  await updateTeacherRating(teacherId);

  return review;
};

// Update review
const updateReview = async (
  userId: string,
  reviewId: string,
  payload: { rating?: number; comment?: string },
) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const student = await StudentModel.findById(user.student);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // Only the student who wrote the review can update it
  if (review.studentId.toString() !== student._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this review",
    );
  }

  const updatedReview = await ReviewModel.findByIdAndUpdate(
    reviewId,
    payload,
    { new: true },
  )
    .populate("studentId", "name email")
    .populate("teacherId", "name email");

  // Recalculate teacher average rating
  await updateTeacherRating(review.teacherId.toString());

  return updatedReview;
};

// Delete review
const deleteReview = async (userId: string, reviewId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const student = await StudentModel.findById(user.student);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const review = await ReviewModel.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // Only the student who wrote the review can delete it
  if (review.studentId.toString() !== student._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to delete this review",
    );
  }

  await ReviewModel.findByIdAndDelete(reviewId);

  // Remove from student reviews array
  await StudentModel.findByIdAndUpdate(student._id, {
    $pull: { reviews: review._id },
  });

  // Recalculate teacher average rating
  await updateTeacherRating(review.teacherId.toString());

  return { message: "Review deleted successfully" };
};

// Get reviews for a teacher
const getTeacherReviews = async (teacherId: string) => {
  const reviews = await ReviewModel.find({ teacherId })
    .populate("studentId", "name email profile")
    .sort({ createdAt: -1 });

  return reviews;
};

// Get all reviews (admin)
const getAllReviews = async () => {
  const reviews = await ReviewModel.find()
    .populate("studentId", "name email")
    .populate("teacherId", "name email")
    .sort({ createdAt: -1 });

  return reviews;
};

// Get my reviews (student)
const getMyReviews = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const reviews = await ReviewModel.find({ studentId: user.student })
    .populate("teacherId", "name email profile")
    .sort({ createdAt: -1 });

  return reviews;
};

// Helper: recalculate teacher average rating
const updateTeacherRating = async (teacherId: string) => {
  const reviews = await ReviewModel.find({ teacherId });

  if (reviews.length === 0) {
    await TeacherModel.findByIdAndUpdate(teacherId, {
      averageRating: 0,
      totalReviews: 0,
    });
    return;
  }

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await TeacherModel.findByIdAndUpdate(teacherId, {
    averageRating: Math.round(avg * 10) / 10, // e.g. 4.3
    totalReviews: reviews.length,
  });
};

export const ReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getTeacherReviews,
  getAllReviews,
  getMyReviews,
};