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
exports.DiscountCodeController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const discountCode_service_1 = require("./discountCode.service");
const user_model_1 = require("../user/user.model");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
// Admin — generate a new code
const generateCode = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { packageId, discountPercent } = req.body;
    const result = yield discountCode_service_1.DiscountCodeService.generateCode(packageId, discountPercent);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Discount code generated successfully",
        data: result,
    });
}));
// Student — validate a code before checkout
const validateCode = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, packageId } = req.body;
    const userId = req.user.userId;
    const user = yield user_model_1.UserModel.findById(userId);
    if (!(user === null || user === void 0 ? void 0 : user.student)) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const result = yield discountCode_service_1.DiscountCodeService.validateCode(code, packageId, user.student.toString());
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Discount code is valid",
        data: result,
    });
}));
// Admin — get all codes
const getAllCodes = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield discountCode_service_1.DiscountCodeService.getAllCodes();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All discount codes fetched",
        data: result,
    });
}));
// Admin — delete a code
const deleteCode = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield discountCode_service_1.DiscountCodeService.deleteCode(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Discount code deleted",
        data: null,
    });
}));
exports.DiscountCodeController = {
    generateCode,
    validateCode,
    getAllCodes,
    deleteCode,
};
