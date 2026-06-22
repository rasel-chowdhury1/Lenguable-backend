"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OurStorySchema = new mongoose_1.Schema({
    sectionTitle: { type: String, required: true, trim: true },
    paragraphs: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => v.length >= 1,
            message: "At least one paragraph is required",
        },
    },
    signature: { type: String, required: true, trim: true },
    founderImage: { type: String, required: true },
}, { timestamps: true, versionKey: false });
const OurStory = (0, mongoose_1.model)("OurStory", OurStorySchema);
exports.default = OurStory;
