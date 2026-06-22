"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTA2 = void 0;
const mongoose_1 = require("mongoose");
const CTA2Schema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
}, { timestamps: true, versionKey: false });
exports.CTA2 = (0, mongoose_1.model)("CTA2", CTA2Schema);
