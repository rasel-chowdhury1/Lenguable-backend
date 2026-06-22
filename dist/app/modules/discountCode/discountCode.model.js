"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountCodeModel = void 0;
const mongoose_1 = require("mongoose");
const DiscountCodeSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountPercent: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    packageId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Package",
        required: true,
    },
    usedBy: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],
    usedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true, versionKey: false });
exports.DiscountCodeModel = (0, mongoose_1.model)("DiscountCode", DiscountCodeSchema);
