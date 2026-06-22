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
exports.DiscountCodeService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const discountCode_model_1 = require("./discountCode.model");
const package_model_1 = require("../package/package.model");
const generateCode = (packageId, discountPercent) => __awaiter(void 0, void 0, void 0, function* () {
    const packageData = yield package_model_1.PackageModel.findById(packageId);
    if (!packageData) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    }
    const code = "DISC-" + crypto_1.default.randomBytes(3).toString("hex").toUpperCase();
    const discountCode = yield discountCode_model_1.DiscountCodeModel.create({
        code,
        discountPercent,
        packageId,
        usedBy: [],
    });
    return discountCode;
});
// Read-only check — called from /validate endpoint (Apply button)
const validateCode = (code, packageId, studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const discountCode = yield discountCode_model_1.DiscountCodeModel.findOne({
        code: code.toUpperCase().trim(),
    }).populate("packageId", "name");
    if (!discountCode)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Invalid discount code");
    if (discountCode.packageId._id.toString() !== packageId) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `This code can only be used for the ${discountCode.packageId.name} package`);
    }
    // Check if THIS student already used a coupon on THIS package
    const alreadyUsed = yield discountCode_model_1.DiscountCodeModel.findOne({
        packageId: new mongoose_1.Types.ObjectId(packageId),
        usedBy: new mongoose_1.Types.ObjectId(studentId),
    });
    if (alreadyUsed) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "You have already used a discount code for this package");
    }
    return {
        valid: true,
        discountPercent: discountCode.discountPercent,
        codeId: discountCode._id.toString(),
    };
});
// Called at checkout session creation — immediately locks the code for this student
const claimCode = (code, packageId, studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const discountCode = yield discountCode_model_1.DiscountCodeModel.findOne({
        code: code.toUpperCase().trim(),
    }).populate("packageId", "name");
    if (!discountCode)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Invalid discount code");
    if (discountCode.packageId._id.toString() !== packageId) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `This code can only be used for the ${discountCode.packageId.name} package`);
    }
    // Check if THIS student already used a coupon on THIS package
    const alreadyUsed = yield discountCode_model_1.DiscountCodeModel.findOne({
        packageId: new mongoose_1.Types.ObjectId(packageId),
        usedBy: new mongoose_1.Types.ObjectId(studentId),
    });
    if (alreadyUsed) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "You have already used a discount code for this package");
    }
    // Immediately push studentId so they can't use another code on this package
    yield discountCode_model_1.DiscountCodeModel.findByIdAndUpdate(discountCode._id, {
        $push: { usedBy: new mongoose_1.Types.ObjectId(studentId) },
        $set: { usedAt: new Date() },
    });
    return {
        valid: true,
        discountPercent: discountCode.discountPercent,
        codeId: discountCode._id.toString(),
    };
});
// No-op — already recorded in claimCode
const markCodeAsUsed = (codeId, studentId) => __awaiter(void 0, void 0, void 0, function* () { });
const getAllCodes = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield discountCode_model_1.DiscountCodeModel.find()
        .populate("packageId", "name price")
        .populate("usedBy", "name email")
        .sort({ createdAt: -1 });
});
const deleteCode = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield discountCode_model_1.DiscountCodeModel.findByIdAndDelete(id);
});
exports.DiscountCodeService = {
    generateCode,
    validateCode,
    claimCode,
    markCodeAsUsed,
    getAllCodes,
    deleteCode,
};
