"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseModel = void 0;
const mongoose_1 = require("mongoose");
const PurchaseSchema = new mongoose_1.Schema({
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
    price: {
        type: Number,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Add indexes
PurchaseSchema.index({ studentId: 1 });
PurchaseSchema.index({ packageId: 1 });
PurchaseSchema.index({ studentId: 1, packageId: 1 });
exports.PurchaseModel = (0, mongoose_1.model)("Purchase", PurchaseSchema);
