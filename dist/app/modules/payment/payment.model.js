"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    packageId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Package",
        required: true,
    },
    stripeSessionId: {
        type: String,
        required: true,
        unique: true,
    },
    stripePaymentIntentId: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "usd",
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
    },
    paidAt: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.PaymentModel = (0, mongoose_1.model)("Payment", PaymentSchema);
