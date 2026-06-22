"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityModel = void 0;
const mongoose_1 = require("mongoose");
const SlotSchema = new mongoose_1.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
}, { _id: true });
const AvailabilitySchema = new mongoose_1.Schema({
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    day: {
        type: String,
        enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ],
        required: true,
    },
    date: {
        type: String,
        required: true, // YYYY-MM-DD
    },
    utcDate: {
        type: Date,
        requred: true
    },
    slots: { type: [SlotSchema], required: true },
}, { timestamps: true, versionKey: false });
// One availability doc per teacher per date
AvailabilitySchema.index({ teacherId: 1, date: 1 }, { unique: true });
exports.AvailabilityModel = (0, mongoose_1.model)("PreAvailability", AvailabilitySchema);
