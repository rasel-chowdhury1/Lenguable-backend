"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.About = void 0;
const mongoose_1 = require("mongoose");
const StatItemSchema = new mongoose_1.Schema({
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
}, { _id: false, versionKey: false });
const AboutSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    stats: { type: [StatItemSchema], required: true },
}, { timestamps: true, versionKey: false });
exports.About = (0, mongoose_1.model)("About", AboutSchema);
