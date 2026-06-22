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
exports.ResourceService = void 0;
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const resource_model_1 = require("./resource.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createResource = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistResource = yield resource_model_1.ResourceModel.findOne({
        title: payload.title,
    });
    if (isExistResource) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Resource already exist !");
    }
    const result = yield resource_model_1.ResourceModel.create(payload);
    return result;
});
const getAllResources = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield resource_model_1.ResourceModel.find().sort({ createdAt: -1 });
    return result;
});
const getSingleResource = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield resource_model_1.ResourceModel.findById(id);
    return result;
});
const updateResource = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistResource = yield resource_model_1.ResourceModel.findById(id);
    if (!isExistResource) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Resource not found !");
    }
    const result = yield resource_model_1.ResourceModel.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteResource = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield resource_model_1.ResourceModel.findByIdAndDelete(id);
    return result;
});
exports.ResourceService = {
    createResource,
    getAllResources,
    getSingleResource,
    updateResource,
    deleteResource,
};
