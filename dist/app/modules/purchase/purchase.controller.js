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
exports.PurchaseController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const purchase_service_1 = require("./purchase.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const stripe_1 = __importDefault(require("../../config/stripe"));
const config_1 = require("../../config");
// POST /purchase/checkout
const createCheckoutSession = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = req.user.userId;
    const { packageId, discountCode } = req.body; // get discountCode
    const result = yield purchase_service_1.PurchaseService.createCheckoutSession(studentId, packageId, discountCode);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Checkout session created",
        data: result,
    });
}));
// POST /purchase/webhook
const stripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔔 Webhook hit!");
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe_1.default.webhooks.constructEvent(req.body, sig, config_1.envVars.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        if (session.payment_status === "paid") {
            const { userId, packageId, studentId, appliedCodeId } = session.metadata;
            if (!userId || !packageId || !studentId) {
                console.log("⚠️ Missing metadata — skipping fulfillment");
                return res.json({ received: true });
            }
            try {
                yield purchase_service_1.PurchaseService.fulfillPurchase(userId, packageId, studentId, session.id, session.payment_intent, appliedCodeId || undefined);
                console.log(`✅ Purchase fulfilled — student: ${studentId}`);
            }
            catch (err) {
                console.error("❌ Error fulfilling purchase:", err);
                return res.status(500).json({ error: "Fulfillment failed" });
            }
        }
    }
    res.json({ received: true });
});
// GET /purchase — admin
const getAllPurchases = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchase_service_1.PurchaseService.getAllPurchases();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All purchases fetched successfully",
        data: result,
    });
}));
// GET /purchase/verify?session_id=xxx
const verifySession = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { session_id } = req.query;
    const userId = req.user.userId;
    const result = yield purchase_service_1.PurchaseService.verifyAndFulfillSession(session_id, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payment verified successfully",
        data: result,
    });
}));
exports.PurchaseController = {
    createCheckoutSession,
    stripeWebhook,
    getAllPurchases,
    verifySession,
};
