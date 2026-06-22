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
exports.OurStoryController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const our_story_service_1 = require("./our-story.service");
const sendResponse_1 = require("../../utils/sendResponse");
const createOurStory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), { founderImage: req.file.path });
    const result = yield our_story_service_1.OurStoryServices.createOurStory(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Our Story section created successfully",
        data: result,
    });
}));
const getAllOurStory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield our_story_service_1.OurStoryServices.getAllOurStory();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Our Story sections retrieved successfully",
        data: result,
    });
}));
const getOurStoryById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield our_story_service_1.OurStoryServices.getOurStoryById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Our Story section retrieved successfully",
        data: result,
    });
}));
const updateOurStory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), (req.file && { founderImage: req.file.path }));
    const result = yield our_story_service_1.OurStoryServices.updateOurStory(req.params.id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Our Story section updated successfully",
        data: result,
    });
}));
const deleteOurStory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield our_story_service_1.OurStoryServices.deleteOurStory(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Our Story section deleted successfully",
        data: result,
    });
}));
exports.OurStoryController = {
    createOurStory,
    getAllOurStory,
    getOurStoryById,
    updateOurStory,
    deleteOurStory,
};
