"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutModel = void 0;
const mongoose_1 = require("mongoose");
const PayoutSchema = new mongoose_1.Schema({
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    stripeTransferId: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    paidAt: {
        type: Date,
    },
    failureReason: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.PayoutModel = (0, mongoose_1.model)("Payout", PayoutSchema);
