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
exports.HowItWorksController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const howItWorks_service_1 = require("./howItWorks.service");
const createHowItWorks = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), { image: req.file.path });
    const result = yield howItWorks_service_1.HowItWorksServices.createHowItWorks(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "HowItWorks section created successfully",
        data: result,
    });
}));
const getAllHowItWorks = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_service_1.HowItWorksServices.getAllHowItWorks();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "HowItWorks sections retrieved successfully",
        data: result,
    });
}));
const getHowItWorksById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_service_1.HowItWorksServices.getHowItWorksById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "HowItWorks section retrieved successfully",
        data: result,
    });
}));
const updateHowItWorks = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), (req.file && { image: req.file.path }));
    const result = yield howItWorks_service_1.HowItWorksServices.updateHowItWorks(req.params.id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "HowItWorks section updated successfully",
        data: result,
    });
}));
const deleteHowItWorks = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_service_1.HowItWorksServices.deleteHowItWorks(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "HowItWorks section deleted successfully",
        data: result,
    });
}));
exports.HowItWorksController = {
    createHowItWorks,
    getAllHowItWorks,
    getHowItWorksById,
    updateHowItWorks,
    deleteHowItWorks,
};
