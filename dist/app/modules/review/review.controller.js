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
exports.ReviewController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const review_service_1 = require("./review.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
// Student: create a review
const createReview = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield review_service_1.ReviewService.createReview(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Review submitted successfully",
        data: result,
    });
}));
// Student: update own review 
const updateReview = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const result = yield review_service_1.ReviewService.updateReview(userId, reviewId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Review updated successfully",
        data: result,
    });
}));
// Student: delete own review
const deleteReview = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const result = yield review_service_1.ReviewService.deleteReview(userId, reviewId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Review deleted successfully",
        data: result,
    });
}));
// Public: get reviews for a teacher
const getTeacherReviews = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teacherId } = req.params;
    const result = yield review_service_1.ReviewService.getTeacherReviews(teacherId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Teacher reviews fetched successfully",
        data: result,
    });
}));
// Admin: get all reviews
const getAllReviews = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewService.getAllReviews();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All reviews fetched successfully",
        data: result,
    });
}));
// Student: get own reviews
const getMyReviews = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield review_service_1.ReviewService.getMyReviews(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My reviews fetched successfully",
        data: result,
    });
}));
exports.ReviewController = {
    createReview,
    updateReview,
    deleteReview,
    getTeacherReviews,
    getAllReviews,
    getMyReviews,
};
