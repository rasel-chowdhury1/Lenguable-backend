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
exports.StatsController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const stats_service_1 = require("./stats.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const getOverviewStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const period = (_a = req.query.period) !== null && _a !== void 0 ? _a : "weekly";
    const data = yield stats_service_1.StatsService.getOverviewStats(period);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Overview stats fetched successfully",
        data,
    });
}));
const getWeeklyFinancials = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const weeks = parseInt((_a = req.query.weeks) !== null && _a !== void 0 ? _a : "4", 10);
    const data = yield stats_service_1.StatsService.getWeeklyFinancials(weeks);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Weekly financials fetched successfully",
        data,
    });
}));
const getDashboardStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const period = (_a = req.query.period) !== null && _a !== void 0 ? _a : "weekly";
    const weeks = parseInt((_b = req.query.weeks) !== null && _b !== void 0 ? _b : "4", 10);
    const data = yield stats_service_1.StatsService.getDashboardStats(period, weeks);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Dashboard stats fetched successfully",
        data,
    });
}));
exports.StatsController = {
    getOverviewStats,
    getWeeklyFinancials,
    getDashboardStats,
};
