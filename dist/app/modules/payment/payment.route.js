"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
// Admin — get all payments
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), payment_controller_1.PaymentController.getAllPayments);
// Student — get their own payment history
router.get("/my", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), payment_controller_1.PaymentController.getMyPayments);
// Get single payment by Stripe session ID (used on success page)
router.get("/session/:sessionId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), payment_controller_1.PaymentController.getPaymentBySessionId);
exports.PaymentRoutes = router;
