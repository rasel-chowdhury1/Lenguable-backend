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
exports.BookingController = void 0;
const booking_service_1 = require("./booking.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createBooking = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield booking_service_1.BookingService.createBooking(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Booking created successfully",
        data: result,
    });
}));
const getMyBookings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const timezone = req.query.timezone;
    const result = yield booking_service_1.BookingService.getMyBookings(userId, timezone);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Bookings retrieved successfully",
        data: result,
    });
}));
const cancelBooking = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { bookingId } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: false,
            statusCode: http_status_codes_1.default.BAD_REQUEST,
            message: "Cancellation reason is required",
            data: null,
        });
    }
    const result = yield booking_service_1.BookingService.cancelBooking(userId, bookingId, reason);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: result.message,
        data: {
            refunded: result.refunded,
            cancelledBy: result.cancelledBy,
        },
    });
}));
const markTeacherJoined = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { bookingId } = req.params;
    const result = yield booking_service_1.BookingService.markTeacherJoined(userId, bookingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Teacher attendance marked",
        data: result,
    });
}));
const markStudentJoined = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("HIT markStudentJoined controller, bookingId:", req.params.bookingId, "userId:", req.user.userId);
    const result = yield booking_service_1.BookingService.markStudentJoined(req.user.userId, req.params.bookingId);
    console.log("Service result:", result);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Joined successfully",
        data: result,
    });
}));
exports.BookingController = {
    createBooking,
    getMyBookings,
    cancelBooking,
    markTeacherJoined,
    markStudentJoined
};
