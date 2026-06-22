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
exports.PaymentController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const payment_service_1 = require("./payment.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
// GET /payment — admin gets all payments
const getAllPayments = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_service_1.PaymentService.getAllPayments();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All payments fetched successfully",
        data: result,
    });
}));
// GET /payment/my — student gets their own payments
const getMyPayments = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = req.user.userId;
    const result = yield payment_service_1.PaymentService.getMyPayments(studentId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payment history fetched successfully",
        data: result,
    });
}));
// GET /payment/session/:sessionId — get single payment by session
const getPaymentBySessionId = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.params;
    const result = yield payment_service_1.PaymentService.getPaymentBySessionId(sessionId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payment fetched successfully",
        data: result,
    });
}));
exports.PaymentController = {
    getAllPayments,
    getMyPayments,
    getPaymentBySessionId,
};
