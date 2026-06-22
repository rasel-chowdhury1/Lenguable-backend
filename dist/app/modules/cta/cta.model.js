"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTA = void 0;
const mongoose_1 = require("mongoose");
const ctaSchema = new mongoose_1.Schema({
    badgeText: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
}, { timestamps: true });
exports.CTA = (0, mongoose_1.model)("CTA", ctaSchema);
