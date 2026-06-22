"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const review_model_1 = require("./review.model");
const booking_model_1 = require("../booking/booking.model");
const student_model_1 = require("../student/student.model");
const teacher_model_1 = require("../teacher/teacher.model");
const user_model_1 = require("../user/user.model");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Create a review
const createReview = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { teacherId, rating, comment } = payload;
    // Get student
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const student = yield student_model_1.StudentModel.findById(user.student);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    // Check teacher exists
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId);
    if (!teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    // Check student has at least one completed booking with this teacher
    const completedBooking = yield booking_model_1.BookingModel.findOne({
        studentId: student._id,
        teacherId,
        status: "completed",
    });
    if (!completedBooking) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You can only review a teacher after completing a class with them");
    }
    // Check if already reviewed this teacher
    const existingReview = yield review_model_1.ReviewModel.findOne({
        studentId: student._id,
        teacherId,
    });
    if (existingReview) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "You have already reviewed this teacher");
    }
    // Create review
    const review = yield review_model_1.ReviewModel.create({
        studentId: student._id,
        teacherId,
        rating,
        comment,
    });
    // Push review to student
    yield student_model_1.StudentModel.findByIdAndUpdate(student._id, {
        $push: { reviews: review._id },
    });
    // Update teacher average rating
    yield updateTeacherRating(teacherId);
    return review;
});
// Update review
const updateReview = (userId, reviewId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const student = yield student_model_1.StudentModel.findById(user.student);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const review = yield review_model_1.ReviewModel.findById(reviewId);
    if (!review) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
    }
    // Only the student who wrote the review can update it
    if (review.studentId.toString() !== student._id.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not allowed to update this review");
    }
    const updatedReview = yield review_model_1.ReviewModel.findByIdAndUpdate(reviewId, payload, { new: true })
        .populate("studentId", "name email")
        .populate("teacherId", "name email");
    // Recalculate teacher average rating
    yield updateTeacherRating(review.teacherId.toString());
    return updatedReview;
});
// Delete review
const deleteReview = (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const student = yield student_model_1.StudentModel.findById(user.student);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const review = yield review_model_1.ReviewModel.findById(reviewId);
    if (!review) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
    }
    // Only the student who wrote the review can delete it
    if (review.studentId.toString() !== student._id.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not allowed to delete this review");
    }
    yield review_model_1.ReviewModel.findByIdAndDelete(reviewId);
    // Remove from student reviews array
    yield student_model_1.StudentModel.findByIdAndUpdate(student._id, {
        $pull: { reviews: review._id },
    });
    // Recalculate teacher average rating
    yield updateTeacherRating(review.teacherId.toString());
    return { message: "Review deleted successfully" };
});
// Get reviews for a teacher
const getTeacherReviews = (teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.ReviewModel.find({ teacherId })
        .populate("studentId", "name email profile")
        .sort({ createdAt: -1 });
    return reviews;
});
// Get all reviews (admin)
const getAllReviews = () => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.ReviewModel.find()
        .populate("studentId", "name email")
        .populate("teacherId", "name email")
        .sort({ createdAt: -1 });
    return reviews;
});
// Get my reviews (student)
const getMyReviews = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const reviews = yield review_model_1.ReviewModel.find({ studentId: user.student })
        .populate("teacherId", "name email profile")
        .sort({ createdAt: -1 });
    return reviews;
});
// Helper: recalculate teacher average rating
const updateTeacherRating = (teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.ReviewModel.find({ teacherId });
    if (reviews.length === 0) {
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, {
            averageRating: 0,
            totalReviews: 0,
        });
        return;
    }
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, {
        averageRating: Math.round(avg * 10) / 10, // e.g. 4.3
        totalReviews: reviews.length,
    });
});
exports.ReviewService = {
    createReview,
    updateReview,
    deleteReview,
    getTeacherReviews,
    getAllReviews,
    getMyReviews,
};
