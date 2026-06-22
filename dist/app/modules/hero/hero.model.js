"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hero = void 0;
const mongoose_1 = require("mongoose");
const heroSchema = new mongoose_1.Schema({
    badge: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    cardTitle: { type: String, required: true },
    cardDescription: { type: String, required: true },
}, { timestamps: true, versionKey: false });
exports.Hero = (0, mongoose_1.model)("Hero", heroSchema);
