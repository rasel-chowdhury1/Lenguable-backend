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
exports.PayoutController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const payout_service_1 = require("./payout.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const user_model_1 = require("../user/user.model");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
// Teacher: start Stripe Connect onboarding
const connectStripe = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const result = yield payout_service_1.PayoutService.createStripeConnectAccount(user.teacher.toString());
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Stripe onboarding link generated",
        data: result, // { url }
    });
}));
// Teacher: check onboarding status
const checkOnboardingStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const result = yield payout_service_1.PayoutService.checkStripeOnboardingStatus(user.teacher.toString());
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Onboarding status fetched",
        data: result,
    });
}));
// Teacher: get own payout history
const getMyPayouts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    const result = yield payout_service_1.PayoutService.getMyPayouts(user.teacher.toString());
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payout history fetched",
        data: result,
    });
}));
// Admin: get all payouts
const getAllPayouts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payout_service_1.PayoutService.getAllPayouts();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All payouts fetched",
        data: result,
    });
}));
// Admin: manually trigger all payouts
const triggerAllPayouts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payout_service_1.PayoutService.processAllTeacherPayouts();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payouts processed successfully",
        data: result,
    });
}));
exports.PayoutController = {
    connectStripe,
    checkOnboardingStatus,
    getMyPayouts,
    getAllPayouts,
    triggerAllPayouts,
};
