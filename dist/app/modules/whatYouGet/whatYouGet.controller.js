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
exports.WhatYouGetController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const whatYouGet_service_1 = require("./whatYouGet.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const createWhatYouGet = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result = yield whatYouGet_service_1.WhatYouGetServices.createWhatYouGet(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "WhatYouGet section created successfully",
        data: result,
    });
}));
const getAllWhatYouGet = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield whatYouGet_service_1.WhatYouGetServices.getAllWhatYouGet();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "WhatYouGet sections retrieved successfully",
        data: result,
    });
}));
const getWhatYouGetById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield whatYouGet_service_1.WhatYouGetServices.getWhatYouGetById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "WhatYouGet section retrieved successfully",
        data: result,
    });
}));
const updateWhatYouGet = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield whatYouGet_service_1.WhatYouGetServices.updateWhatYouGet(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "WhatYouGet section updated successfully",
        data: result,
    });
}));
const deleteWhatYouGet = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield whatYouGet_service_1.WhatYouGetServices.deleteWhatYouGet(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "WhatYouGet section deleted successfully",
        data: result,
    });
}));
exports.WhatYouGetController = {
    createWhatYouGet,
    getAllWhatYouGet,
    getWhatYouGetById,
    updateWhatYouGet,
    deleteWhatYouGet,
};
