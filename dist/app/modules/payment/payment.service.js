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
exports.PaymentService = void 0;
const payment_model_1 = require("./payment.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const student_model_1 = require("../student/student.model");
// Create a pending payment record when checkout session is created
const createPayment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.PaymentModel.create({
        studentId: data.studentId,
        packageId: data.packageId,
        stripeSessionId: data.stripeSessionId,
        amount: data.amount,
        currency: data.currency || "usd",
        status: "pending",
    });
    // Push payment reference into the student's payment array
    yield student_model_1.StudentModel.findByIdAndUpdate(data.studentId, { $push: { payment: payment._id } }, { new: true });
    return payment;
});
// Mark payment as completed after webhook confirms
const markPaymentCompleted = (stripeSessionId, stripePaymentIntentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.PaymentModel.findOneAndUpdate({ stripeSessionId }, // ✅ must match exact field name in your model
    {
        status: "completed",
        stripePaymentIntentId,
        paidAt: new Date(),
    }, { new: true });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment record not found");
    }
    return payment;
});
// Get all payments (admin)
const getAllPayments = () => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield payment_model_1.PaymentModel.find()
        .populate("studentId", "name email")
        .populate("packageId", "name price credits")
        .sort({ createdAt: -1 });
    return payments;
});
// Get payments by student
const getMyPayments = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield payment_model_1.PaymentModel.find({ studentId })
        .populate("packageId", "name price credits")
        .sort({ createdAt: -1 });
    return payments;
});
// Get single payment
const getPaymentBySessionId = (stripeSessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.PaymentModel.findOne({ stripeSessionId })
        .populate("studentId", "name email")
        .populate("packageId", "name price credits");
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment not found");
    }
    return payment;
});
exports.PaymentService = {
    createPayment,
    markPaymentCompleted,
    getAllPayments,
    getMyPayments,
    getPaymentBySessionId,
};
