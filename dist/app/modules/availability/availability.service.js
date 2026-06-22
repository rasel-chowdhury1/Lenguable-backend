"use strict";
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
exports.NewAvailabilityService = void 0;
const luxon_1 = require("luxon");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const user_model_1 = require("../user/user.model");
const teacher_model_1 = require("../teacher/teacher.model");
const availability_model_1 = require("./availability.model");
// Converts a local date + time string (e.g. "2026-06-20", "14:00") in the given
// timezone into a UTC Date. Throws if the combination is not a valid datetime.
const localToUtcDate = (date, time, tz) => {
    const dt = luxon_1.DateTime.fromFormat(`${date} ${time}`, "yyyy-MM-dd HH:mm", {
        zone: tz,
    });
    if (!dt.isValid) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid date/time: ${date} ${time} in zone ${tz}`);
    }
    return dt.toUTC().toJSDate();
};
// Returns "yyyy-MM-dd" for a UTC Date expressed in the viewer's local timezone.
const utcToLocalDate = (utcDate, tz) => luxon_1.DateTime.fromJSDate(utcDate).setZone(tz).toFormat("yyyy-MM-dd");
// Returns the full weekday name (e.g. "Monday") for a UTC Date in the viewer's timezone.
const utcToLocalDay = (utcDate, tz) => luxon_1.DateTime.fromJSDate(utcDate).setZone(tz).toFormat("cccc");
// Breaks any slot longer than 1 hour into consecutive 1-hour slots.
// Slots that are exactly 1 hour (or shorter) are kept as-is.
const splitIntoHourlySlots = (slots) => {
    const result = [];
    for (const slot of slots) {
        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        if (endTotal <= startTotal) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `End time must be after start time: ${slot.startTime} - ${slot.endTime}`);
        }
        const toTime = (mins) => `${Math.floor(mins / 60).toString().padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;
        if (endTotal - startTotal <= 60) {
            result.push(slot);
            continue;
        }
        let current = startTotal;
        while (current + 60 <= endTotal) {
            result.push({ startTime: toTime(current), endTime: toTime(current + 60) });
            current += 60;
        }
    }
    return result;
};
// Groups a flat list of UTC slots into an array of { _id, day, date, slots[] }
// objects keyed by local date in the viewer's timezone, sorted ascending by date.
const groupSlotsByLocalDate = (slots, tz) => {
    const grouped = {};
    for (const slot of slots) {
        const localDate = utcToLocalDate(new Date(slot.startTime), tz);
        const localDay = utcToLocalDay(new Date(slot.startTime), tz);
        if (!grouped[localDate]) {
            grouped[localDate] = {
                _id: slot.availabilityId,
                day: localDay,
                date: localDate,
                slots: [],
            };
        }
        grouped[localDate].slots.push({
            _id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
        });
    }
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};
// Creates new availability slots for a teacher. Slots are stored as UTC in the DB.
// Duplicates are silently skipped; overlapping slots throw a CONFLICT error.
// If no availability document exists yet for this teacher, one is created and
// linked to the teacher profile. Otherwise slots are appended to the existing doc.
const createAvailability = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher profile not found for this user");
    }
    const teacherId = user.teacher;
    // Prefer payload timezone → user's saved timezone → UTC fallback
    const tz = payload.timezone || user.timezone || "UTC";
    const availabilityDoc = yield availability_model_1.AvailabilityModel.findOne({ teacherId });
    const existingSlots = (_a = availabilityDoc === null || availabilityDoc === void 0 ? void 0 : availabilityDoc.slots) !== null && _a !== void 0 ? _a : [];
    const newUtcSlots = [];
    for (const item of payload.availabilities) {
        // Reject past dates based on the teacher's local timezone
        const todayLocal = luxon_1.DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
        if (item.date < todayLocal) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot create availability for a past date: ${item.date}`);
        }
        // Split any multi-hour range into individual 1-hour booking units
        const hourlySlots = splitIntoHourlySlots(item.slots);
        for (const slot of hourlySlots) {
            const startUtc = localToUtcDate(item.date, slot.startTime, tz);
            const endUtc = localToUtcDate(item.date, slot.endTime, tz);
            // Skip if an identical slot already exists (idempotent re-submission)
            const isDuplicate = existingSlots.some((s) => new Date(s.startTime).getTime() === startUtc.getTime() &&
                new Date(s.endTime).getTime() === endUtc.getTime());
            if (isDuplicate)
                continue;
            // Prevent partial overlaps (e.g. 10:00–11:00 when 10:30–11:30 already exists)
            const hasOverlap = existingSlots.some((s) => startUtc < new Date(s.endTime) && endUtc > new Date(s.startTime));
            if (hasOverlap) {
                throw new AppError_1.default(http_status_codes_1.default.CONFLICT, `Slot ${slot.startTime}–${slot.endTime} on ${item.date} overlaps with an existing slot`);
            }
            newUtcSlots.push({ startTime: startUtc, endTime: endUtc });
        }
    }
    if (newUtcSlots.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "All selected availability slots already exist.");
    }
    if (!availabilityDoc) {
        // First-time setup: create the availability document and link it to the teacher
        const created = yield availability_model_1.AvailabilityModel.create({
            teacherId,
            timezone: tz,
            slots: newUtcSlots,
        });
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, {
            $push: { availabilities: created._id },
        });
        return created;
    }
    // Append new slots to the existing availability document
    availabilityDoc.slots.push(...newUtcSlots);
    yield availabilityDoc.save();
    return availabilityDoc;
});
// Returns the teacher's own future availability slots grouped by local date.
// Past slots (startTime < now) are filtered out before returning.
const getMyAvailability = (userId, viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user || !user.teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher profile not found for this user");
    }
    const tz = viewerTimezone || user.timezone || "UTC";
    const nowUtc = luxon_1.DateTime.now().toUTC().toJSDate();
    const availabilityDocs = yield availability_model_1.AvailabilityModel.find({
        teacherId: user.teacher,
    });
    if (!availabilityDocs.length)
        return [];
    // Flatten all docs into a single slot list, attaching the parent doc _id so
    // the client can reference it for updates/deletes
    const allSlots = availabilityDocs.flatMap((doc) => doc.slots
        .filter((s) => new Date(s.startTime) >= nowUtc)
        .map((s) => (Object.assign(Object.assign({}, s.toObject()), { availabilityId: doc._id }))));
    allSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const result = groupSlotsByLocalDate(allSlots, tz);
    return result;
});
// Updates a single slot's start/end time or isBooked flag.
// Time updates are validated against the teacher's timezone and checked for
// overlaps with sibling slots in the same availability document.
const updateSlot = (userId, availabilityId, slotId, payload) => __awaiter(void 0, void 0, void 0, function* () {
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
    const tz = payload.timezone || user.timezone || "UTC";
    if (payload.startTime || payload.endTime) {
        // Derive the local date from the existing slot so the caller only needs to
        // pass the new time, not the full date again
        const localDate = utcToLocalDate(new Date(slot.startTime), tz);
        const newStartUtc = payload.startTime
            ? localToUtcDate(localDate, payload.startTime, tz)
            : new Date(slot.startTime);
        const newEndUtc = payload.endTime
            ? localToUtcDate(localDate, payload.endTime, tz)
            : new Date(slot.endTime);
        // Exclude the current slot from the overlap check (it's being replaced)
        const otherSlots = availability.slots.filter((s) => String(s._id) !== slotId);
        const hasOverlap = otherSlots.some((s) => newStartUtc < new Date(s.endTime) && newEndUtc > new Date(s.startTime));
        if (hasOverlap) {
            throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Updated slot overlaps with an existing slot");
        }
        slot.startTime = newStartUtc;
        slot.endTime = newEndUtc;
    }
    if (payload.isBooked !== undefined)
        slot.isBooked = payload.isBooked;
    yield availability.save();
    return availability;
});
// Deletes a single unbooked slot. If it was the last slot in the availability
// document, the entire document is also deleted to avoid orphaned records.
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
    // Booked slots cannot be deleted — cancellation must go through the booking flow
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
// Finds all teachers who have an available (unbooked) slot at the exact UTC time
// that corresponds to the given local date + time in the viewer's timezone.
const searchTeachersByAvailability = (date, time, viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    const tz = viewerTimezone || "UTC";
    const todayLocal = luxon_1.DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
    if (date < todayLocal) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot search availability for past dates");
    }
    const targetUtc = localToUtcDate(date, time, tz);
    const availabilities = yield availability_model_1.AvailabilityModel.find({
        slots: {
            $elemMatch: {
                startTime: targetUtc,
                isBooked: false,
            },
        },
    }).populate("teacherId", "name email nationality experience profilePicture");
    // Exclude any availability documents where the teacher ref was deleted
    const validAvailabilities = availabilities.filter((a) => a.teacherId != null);
    return validAvailabilities.map((availability) => {
        const obj = availability.toObject();
        const slot = obj.slots.find((s) => new Date(s.startTime).getTime() === targetUtc.getTime() && !s.isBooked);
        const localDate = slot
            ? utcToLocalDate(new Date(slot.startTime), tz)
            : date;
        const localDay = slot
            ? utcToLocalDay(new Date(slot.startTime), tz)
            : "";
        return {
            teacher: obj.teacherId,
            date: localDate,
            day: localDay,
            slot: slot
                ? {
                    _id: slot._id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isBooked: slot.isBooked,
                }
                : null,
        };
    });
});
// Returns all teachers with future availability, grouped by local date in the
// viewer's timezone. Multiple availability documents per teacher are merged into
// a single slot list before grouping so the response is one entry per teacher per date.
const getAllAvailability = (viewerTimezone) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tz = viewerTimezone || "UTC";
    const nowUtc = luxon_1.DateTime.now().toUTC().toJSDate();
    const availabilities = yield availability_model_1.AvailabilityModel.find().populate("teacherId", "name email nationality experience aboutMe interests languages profilePicture");
    const validAvailabilities = availabilities.filter((a) => a.teacherId != null);
    // Merge all availability docs for the same teacher into one slot pool
    const byTeacher = new Map();
    for (const availability of validAvailabilities) {
        const obj = availability.toObject();
        const teacherKey = String((_a = obj.teacherId._id) !== null && _a !== void 0 ? _a : obj.teacherId);
        if (!byTeacher.has(teacherKey)) {
            byTeacher.set(teacherKey, { teacher: obj.teacherId, slots: [] });
        }
        const futureSlots = obj.slots.filter((s) => new Date(s.startTime) >= nowUtc);
        byTeacher.get(teacherKey).slots.push(...futureSlots);
    }
    const result = [];
    for (const { teacher, slots } of byTeacher.values()) {
        // Skip teachers who have no upcoming slots after filtering
        if (slots.length === 0)
            continue;
        slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        const grouped = groupSlotsByLocalDate(slots, tz);
        for (const group of grouped) {
            result.push(Object.assign({ teacher }, group));
        }
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
});
exports.NewAvailabilityService = {
    createAvailability,
    getMyAvailability,
    updateSlot,
    deleteSlot,
    searchTeachersByAvailability,
    getAllAvailability,
};
