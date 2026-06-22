"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceModel = void 0;
const mongoose_1 = require("mongoose");
const resourceSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
}, { timestamps: true, versionKey: false });
exports.ResourceModel = (0, mongoose_1.model)("Resource", resourceSchema);
