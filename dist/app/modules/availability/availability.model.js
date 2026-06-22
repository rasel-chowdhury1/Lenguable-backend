"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityModel = void 0;
const mongoose_1 = require("mongoose");
const SlotSchema = new mongoose_1.Schema({
    startTime: {
        type: Date, // UTC
        required: true,
    },
    endTime: {
        type: Date, // UTC
        required: true,
    },
    isBooked: {
        type: Boolean,
        default: false,
    },
}, {
    _id: true,
});
const AvailabilitySchema = new mongoose_1.Schema({
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
        index: true,
    },
    timezone: {
        type: String,
        required: true,
    },
    slots: {
        type: [SlotSchema],
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.AvailabilityModel = (0, mongoose_1.model)("Availability", AvailabilitySchema);
