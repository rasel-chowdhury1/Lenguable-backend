"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OfferingSchema = new mongoose_1.Schema({
    icon: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
}, { _id: false });
const WhatYouGetSchema = new mongoose_1.Schema({
    sectionTitle: { type: String, required: true, trim: true },
    sectionSubtitle: { type: String, required: true, trim: true },
    offerings: { type: [OfferingSchema], required: true },
}, { timestamps: true, versionKey: false });
const WhatYouGet = (0, mongoose_1.model)("WhatYouGet", WhatYouGetSchema);
exports.default = WhatYouGet;
