"use strict";
// import { Types } from "mongoose";
// import AppError from "../../helpers/AppError";
// import { TeacherModel } from "../teacher/teacher.model";
// import { UserModel } from "../user/user.model";
// import { IAvailabilityInput } from "./availability.interface";
// import { AvailabilityModel } from "./availability.model";
// import httpStatus from "http-status-codes";
// import { localToUtc, utcToLocal } from "../../utils/timezone";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const teacher_model_1 = require("../teacher/teacher.model");
const user_model_1 = require("../user/user.model");
const availability_model_1 = require("./availability.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const timezone_1 = require("../../utils/timezone");
const luxon_1 = require("luxon");
const splitIntoHourlySlots = (slots) => {
    const result = [];
    for (const slot of slots) {
        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        if (endTotal - startTotal <= 60) {
            result.push(slot);
            continue;
        }
        let current = startTotal;
        while (current + 60 <= endTotal) {
            const next = current + 60;
            const toTime = (mins) => `${Math.floor(mins / 60)
                .toString()
                .padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;
            result.push({ startTime: toTime(current), endTime: toTime(next) });
            current = next;
        }
    }
    return result;
};
const convertAvailabilitiesToTimezone = (availabilities, tz) => {
    return availabilities.map((avail) => {
        var _a;
        const obj = avail.toObject ? avail.toObject() : avail;
        const slots = obj.slots.map((slot) => {
            const start = (0, timezone_1.utcToLocal)(slot.startTime, obj.date, tz);
            const end = (0, timezone_1.utcToLocal)(slot.endTime, obj.date, tz);
            return Object.assign(Object.assign({}, slot), { startTime: start.isoDate, endTime: end.isoDate });
        });
        const firstSlotIso = (_a = slots[0]) === null || _a === void 0 ? void 0 : _a.startTime;
        const localDate = firstSlotIso
            ? new Date(firstSlotIso).toLocaleDateString("en-CA", { timeZone: tz })
            : obj.date;
        const localDay = firstSlotIso
            ? new Date(firstSlotIso).toLocaleDateString("en-US", {
                timeZone: tz,
                weekday: "long",
            })
            : obj.day;
        return Object.assign(Object.assign({}, obj), { date: avail.date, day: avail.day, slots });
    });
};
const createAvailability = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher profile not found for this user");
    }
    const teacherId = user.teacher;
    const tz = payload.timezone || user.timezone || "UTC";
    const createdOrUpdated = [];
    let allDuplicates = true;
    for (let item of payload.availabilities) {
        const hourlySlots = splitIntoHourlySlots(item.slots);
        item = Object.assign(Object.assign({}, item), { slots: hourlySlots });
        const todayUTC = new Date().toISOString().split("T")[0];
        const { utcDate: checkDate } = (0, timezone_1.localToUtc)(item.slots[0].startTime, item.date, tz);
        if (checkDate < todayUTC) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot create availability for a past date: ${item.date}`);
        }
        const utcSlots = item.slots.map((slot) => {
            const start = (0, timezone_1.localToUtc)(slot.startTime, item.date, tz);
            const end = (0, timezone_1.localToUtc)(slot.endTime, item.date, tz);
            return { startTime: start.utcTime, endTime: end.utcTime };
        });
        const { utcDate, utcDay } = (0, timezone_1.localToUtc)(item.slots[0].startTime, item.date, tz);
        const existing = yield availability_model_1.AvailabilityModel.findOne({
            teacherId,
            date: item.date,
        });
        if (existing) {
            const newSlots = utcSlots.filter((slot) => !existing.slots.some((s) => s.startTime === slot.startTime && s.endTime === slot.endTime));
            if (newSlots.length === 0) {
                continue;
            }
            allDuplicates = false;
            existing.slots.push(...newSlots);
            yield existing.save();
            createdOrUpdated.push(existing);
        }
        else {
            allDuplicates = false;
            const created = yield availability_model_1.AvailabilityModel.create({
                teacherId,
                day: item.day,
                date: item.date,
                utcDate: luxon_1.DateTime.fromISO(item.date, {
                    zone: tz,
                })
                    .startOf("day")
                    .toUTC()
                    .toJSDate(),
                slots: utcSlots,
            });
            createdOrUpdated.push(created);
            yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, {
                $push: { availabilities: created._id },
            });
        }
    }
    if (allDuplicates) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "This time slot already exists for the selected date");
    }
    return createdOrUpdated;
});
const getMyAvailability = (userId, viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher profile not found for this user");
    }
    const tz = viewerTimezone || user.timezone || "UTC";
    // const todayUTC = new Date().toISOString().split("T")[0];
    const todayUTC = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
    }).format(new Date());
    const availabilities = yield availability_model_1.AvailabilityModel.find({
        teacherId: user.teacher,
        date: { $gte: todayUTC },
    }).sort({ date: 1 });
    const converted = convertAvailabilitiesToTimezone(availabilities, tz);
    const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
    const result = converted.filter((item) => item.date >= todayLocal);
    return result;
});
const updateSlot = (userId, availabilityId, slotId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher profile not found for this user");
    }
    const tz = payload.timezone || user.timezone || "UTC";
    const availability = yield availability_model_1.AvailabilityModel.findOne({
        _id: availabilityId,
        teacherId: user.teacher,
    });
    if (!availability) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Availability not found");
    }
    const slot = availability.slots.id(slotId);
    if (!slot) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Slot not found");
    }
    if (payload.startTime) {
        const converted = (0, timezone_1.localToUtc)(payload.startTime, availability.date, tz);
        slot.startTime = converted.utcTime;
    }
    if (payload.endTime) {
        const converted = (0, timezone_1.localToUtc)(payload.endTime, availability.date, tz);
        slot.endTime = converted.utcTime;
    }
    if (payload.isBooked !== undefined)
        slot.isBooked = payload.isBooked;
    yield availability.save();
    return availability;
});
const deleteSlot = (userId, availabilityId, slotId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher profile not found for this user");
    }
    const availability = yield availability_model_1.AvailabilityModel.findOne({
        _id: availabilityId,
        teacherId: user.teacher,
    });
    if (!availability) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Availability not found");
    }
    const slot = availability.slots.id(slotId);
    if (!slot) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Slot not found");
    }
    if (slot.isBooked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot delete a booked slot");
    }
    slot.deleteOne();
    if (availability.slots.length === 0) {
        yield availability.deleteOne();
        return null;
    }
    yield availability.save();
    return availability;
});
const searchTeachersByAvailability = (date, time, viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const tz = viewerTimezone || "UTC";
    const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
    if (date < todayLocal) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot search availability for past dates");
    }
    const { utcDate, utcTime } = (() => {
        const converted = (0, timezone_1.localToUtc)(time, date, tz);
        return { utcDate: converted.utcDate, utcTime: converted.utcTime };
    })();
    const availabilities = yield availability_model_1.AvailabilityModel.find({
        date: utcDate,
        slots: { $elemMatch: { startTime: utcTime, isBooked: false } },
    }).populate("teacherId", "name email nationality experience profilePicture");
    const validAvailabilities = availabilities.filter((a) => a.teacherId != null);
    return validAvailabilities.map((availability) => {
        const obj = availability.toObject();
        const slot = obj.slots.find((s) => s.startTime === utcTime && !s.isBooked);
        const convertedSlot = slot
            ? Object.assign(Object.assign({}, slot), { startTime: (0, timezone_1.utcToLocal)(slot.startTime, obj.date, tz).isoDate, endTime: (0, timezone_1.utcToLocal)(slot.endTime, obj.date, tz).isoDate }) : slot;
        const converted = (0, timezone_1.utcToLocal)(utcTime, obj.date, tz);
        return {
            teacher: obj.teacherId,
            date: converted.localDate,
            day: converted.localDay,
            slot: convertedSlot,
        };
    });
});
const getAllAvailability = (viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const tz = viewerTimezone || "UTC";
    const todayUTC = new Date().toISOString().split("T")[0];
    const availabilities = yield availability_model_1.AvailabilityModel.find({
        date: { $gte: todayUTC },
    })
        .sort({ date: 1 })
        .populate("teacherId", "name email nationality experience aboutMe interests languages profilePicture");
    const validAvailabilities = availabilities.filter((a) => a.teacherId != null);
    const converted = convertAvailabilitiesToTimezone(validAvailabilities, tz);
    const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
    return converted.filter((item) => item.date >= todayLocal);
});
exports.AvailabilityService = {
    createAvailability,
    getMyAvailability,
    updateSlot,
    deleteSlot,
    searchTeachersByAvailability,
    getAllAvailability,
};
