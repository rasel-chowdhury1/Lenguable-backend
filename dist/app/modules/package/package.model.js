"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageModel = void 0;
const mongoose_1 = require("mongoose");
const PackageSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    credits: {
        type: Number,
        required: true,
        min: 0,
    },
    perClassPrice: {
        type: Number,
        min: 0,
    },
    features: {
        type: [String],
        required: true,
    },
    isMostPopular: {
        type: Boolean,
        default: false,
    },
    discount: {
        type: Number,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.PackageModel = (0, mongoose_1.model)("Package", PackageSchema);
