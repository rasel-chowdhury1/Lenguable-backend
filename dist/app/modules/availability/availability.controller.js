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
exports.NewAvailabilityController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const availability_service_1 = require("./availability.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const createAvailability = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const timezone = req.query.timezone;
    const result = yield availability_service_1.NewAvailabilityService.createAvailability(userId, Object.assign(Object.assign({}, req.body), { timezone }));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Availabilities created successfully",
        data: result,
    });
}));
const getMyAvailability = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const timezone = req.query.timezone;
    const result = yield availability_service_1.NewAvailabilityService.getMyAvailability(userId, timezone);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Availability retrieved successfully",
        data: result,
    });
}));
const updateSlot = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { availabilityId, slotId } = req.params;
    const timezone = req.query.timezone;
    const result = yield availability_service_1.NewAvailabilityService.updateSlot(userId, availabilityId, slotId, Object.assign(Object.assign({}, req.body), { timezone }));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Slot updated successfully",
        data: result,
    });
}));
const deleteSlot = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { availabilityId, slotId } = req.params;
    const result = yield availability_service_1.NewAvailabilityService.deleteSlot(userId, availabilityId, slotId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Slot deleted successfully",
        data: result,
    });
}));
const searchTeachers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, time, timezone } = req.query;
    const result = yield availability_service_1.NewAvailabilityService.searchTeachersByAvailability(date, time, timezone);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Available teachers retrieved successfully",
        data: result,
    });
}));
const getAllAvailability = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timezone = req.query.timezone;
    const result = yield availability_service_1.NewAvailabilityService.getAllAvailability(timezone);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All availability retrieved successfully",
        data: result,
    });
}));
exports.NewAvailabilityController = {
    createAvailability,
    getMyAvailability,
    updateSlot,
    deleteSlot,
    searchTeachers,
    getAllAvailability,
};
