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
exports.PurchaseService = void 0;
const purchase_model_1 = require("./purchase.model");
const mongoose_1 = require("mongoose");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const package_model_1 = require("../package/package.model");
const student_model_1 = require("../student/student.model");
const user_model_1 = require("../user/user.model");
const payment_service_1 = require("../payment/payment.service");
const discountCode_service_1 = require("../discountCode/discountCode.service");
const stripe_1 = __importDefault(require("../../config/stripe"));
const config_1 = require("../../config");
const createCheckoutSession = (userId, packageId, discountCode) => __awaiter(void 0, void 0, void 0, function* () {
    const packageData = yield package_model_1.PackageModel.findById(packageId);
    if (!packageData) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    }
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    const student = yield student_model_1.StudentModel.findById(user.student);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    let finalPrice = packageData.discount && packageData.discount > 0
        ? packageData.price - (packageData.price * packageData.discount) / 100
        : packageData.price;
    let appliedCodeId = null;
    if (discountCode) {
        // claimCode checks student hasn't used a coupon on this package yet
        const codeResult = yield discountCode_service_1.DiscountCodeService.claimCode(discountCode, packageId, student._id.toString());
        finalPrice = finalPrice - (finalPrice * codeResult.discountPercent) / 100;
        appliedCodeId = codeResult.codeId;
    }
    const session = yield stripe_1.default.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    unit_amount: Math.round(finalPrice * 100),
                    product_data: {
                        name: packageData.name,
                        description: `${packageData.credits} credits${discountCode ? " (Discount applied)" : ""}`,
                    },
                },
                quantity: 1,
            },
        ],
        metadata: {
            userId,
            packageId,
            studentId: student._id.toString(),
            appliedCodeId: appliedCodeId !== null && appliedCodeId !== void 0 ? appliedCodeId : "",
        },
        success_url: `${config_1.envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config_1.envVars.FRONTEND_URL}/payment/cancel`,
    });
    yield payment_service_1.PaymentService.createPayment({
        studentId: student._id.toString(),
        packageId,
        stripeSessionId: session.id,
        amount: finalPrice,
        currency: "usd",
    });
    return { url: session.url, sessionId: session.id };
});
const fulfillPurchase = (userId, packageId, studentId, stripeSessionId, stripePaymentIntentId, appliedCodeId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const packageData = yield package_model_1.PackageModel.findById(packageId);
    if (!packageData) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    }
    const student = yield student_model_1.StudentModel.findById(studentId);
    if (!student) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    // Guard against duplicate webhook delivery
    const isAlreadyPurchased = yield purchase_model_1.PurchaseModel.findOne({
        studentId: student._id,
        packageId,
    });
    if (isAlreadyPurchased) {
        return isAlreadyPurchased;
    }
    const finalPrice = packageData.discount && packageData.discount > 0
        ? packageData.price - (packageData.price * packageData.discount) / 100
        : packageData.price;
    const purchase = yield purchase_model_1.PurchaseModel.create({
        studentId: new mongoose_1.Types.ObjectId(student._id),
        packageId: new mongoose_1.Types.ObjectId(packageId),
        price: finalPrice,
        credits: packageData.credits,
    });
    student.credits = ((_a = student.credits) !== null && _a !== void 0 ? _a : 0) + packageData.credits;
    if (!student.packages)
        student.packages = [];
    student.packages.push(packageData._id);
    yield student.save();
    yield payment_service_1.PaymentService.markPaymentCompleted(stripeSessionId, stripePaymentIntentId);
    // Push this student into usedBy array for this code
    if (appliedCodeId) {
        yield discountCode_service_1.DiscountCodeService.markCodeAsUsed(appliedCodeId, student._id.toString());
    }
    return purchase;
});
const getAllPurchases = () => __awaiter(void 0, void 0, void 0, function* () {
    const purchases = yield purchase_model_1.PurchaseModel.find()
        .populate("studentId", "name email")
        .populate("packageId", "name price credits")
        .sort({ createdAt: -1 });
    return purchases;
});
const verifyAndFulfillSession = (sessionId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield stripe_1.default.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment not completed");
    }
    const { packageId, studentId, appliedCodeId } = session.metadata;
    yield fulfillPurchase(userId, packageId, studentId, session.id, session.payment_intent, appliedCodeId || undefined);
    return { success: true };
});
exports.PurchaseService = {
    createCheckoutSession,
    fulfillPurchase,
    getAllPurchases,
    verifyAndFulfillSession,
};
