"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HowItWorks = void 0;
const mongoose_1 = require("mongoose");
const StepSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
}, { _id: false, versionKey: false });
const HowItWorksSchema = new mongoose_1.Schema({
    sectionTitle: { type: String, required: true, trim: true },
    sectionSubtitle: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    badge: {
        label: { type: String, required: true, trim: true },
        tagline: { type: String, required: true, trim: true },
    },
    steps: { type: [StepSchema], required: true },
}, { timestamps: true, versionKey: false });
exports.HowItWorks = (0, mongoose_1.model)("HowItWorks", HowItWorksSchema);
