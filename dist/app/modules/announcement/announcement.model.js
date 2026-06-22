"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementModel = void 0;
const mongoose_1 = require("mongoose");
const AnnouncementSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    isEnabled: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.AnnouncementModel = (0, mongoose_1.model)("Announcement", AnnouncementSchema);
