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
exports.PackageService = void 0;
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const package_model_1 = require("./package.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createPackage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistingPackage = yield package_model_1.PackageModel.findOne({
        name: payload.name,
    });
    if (isExistingPackage) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Package already exist !");
    }
    const result = yield package_model_1.PackageModel.create(payload);
    return result;
});
const getAllPackages = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_model_1.PackageModel.find();
    return result;
});
const getSinglePackage = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_model_1.PackageModel.findById(id);
    return result;
});
const updatePackage = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const packageData = yield package_model_1.PackageModel.findById(id);
    if (!packageData) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    }
    const result = yield package_model_1.PackageModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deletePackage = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_model_1.PackageModel.findByIdAndDelete(id);
    return result;
});
exports.PackageService = {
    createPackage,
    getAllPackages,
    getSinglePackage,
    updatePackage,
    deletePackage,
};
