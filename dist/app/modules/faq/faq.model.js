"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQ = void 0;
const mongoose_1 = require("mongoose");
const faqSchema = new mongoose_1.Schema({
    sectionTitle: {
        type: String,
        required: true,
    },
    sectionSubtitle: {
        type: String,
        required: true,
    },
    faqs: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
        },
    ],
}, { timestamps: true, versionKey: false });
exports.FAQ = (0, mongoose_1.model)("FAQ", faqSchema);
