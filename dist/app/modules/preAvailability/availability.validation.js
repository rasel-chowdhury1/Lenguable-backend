"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSlotSchema = exports.createAvailabilitySchema = void 0;
const zod_1 = __importDefault(require("zod"));
const slotSchema = zod_1.default.object({
    startTime: zod_1.default.string({ required_error: "Start time is required" }),
    endTime: zod_1.default.string({ required_error: "End time is required" }),
});
const singleAvailabilitySchema = zod_1.default.object({
    day: zod_1.default.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]),
    date: zod_1.default
        .string({ required_error: "Date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    slots: zod_1.default.array(slotSchema).min(1, "At least one slot is required"),
});
exports.createAvailabilitySchema = zod_1.default.object({
    availabilities: zod_1.default
        .array(singleAvailabilitySchema)
        .min(1, "At least one availability is required"),
});
exports.updateSlotSchema = zod_1.default.object({
    startTime: zod_1.default.string().optional(),
    endTime: zod_1.default.string().optional(),
    isBooked: zod_1.default.boolean().optional(),
});
