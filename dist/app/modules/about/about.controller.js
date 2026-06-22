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
exports.AboutController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const about_service_1 = require("./about.service");
const createAbout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Parse stats JSON string sent via FormData
    if (req.body.stats && typeof req.body.stats === "string") {
        req.body.stats = JSON.parse(req.body.stats);
    }
    const payload = Object.assign(Object.assign({}, req.body), { image: req.file.path });
    const result = yield about_service_1.AboutServices.createAbout(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "About section created successfully",
        data: result,
    });
}));
const getAllAbout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_service_1.AboutServices.getAllAbout();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "About sections retrieved successfully",
        data: result,
    });
}));
const getAboutById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_service_1.AboutServices.getAboutById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "About section retrieved successfully",
        data: result,
    });
}));
const updateAbout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Parse stats JSON string sent via FormData
    if (req.body.stats && typeof req.body.stats === "string") {
        req.body.stats = JSON.parse(req.body.stats);
    }
    const payload = Object.assign(Object.assign({}, req.body), (req.file && { image: req.file.path }));
    const result = yield about_service_1.AboutServices.updateAbout(req.params.id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "About section updated successfully",
        data: result,
    });
}));
const deleteAbout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_service_1.AboutServices.deleteAbout(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "About section deleted successfully",
        data: result,
    });
}));
exports.AboutController = {
    createAbout,
    getAllAbout,
    getAboutById,
    updateAbout,
    deleteAbout,
};
