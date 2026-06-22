import { Types } from "mongoose";
import { DateTime } from "luxon";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { UserModel } from "../user/user.model";
import { TeacherModel } from "../teacher/teacher.model";
import { AvailabilityModel } from "./availability.model";
import { IAvailabilityInput, ISlotInput } from "./availability.interface";

// Converts a local date + time string (e.g. "2026-06-20", "14:00") in the given
// timezone into a UTC Date. Throws if the combination is not a valid datetime.
const localToUtcDate = (date: string, time: string, tz: string): Date => {
  const dt = DateTime.fromFormat(`${date} ${time}`, "yyyy-MM-dd HH:mm", {
    zone: tz,
  });
  if (!dt.isValid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid date/time: ${date} ${time} in zone ${tz}`,
    );
  }
  return dt.toUTC().toJSDate();
};

// Returns "yyyy-MM-dd" for a UTC Date expressed in the viewer's local timezone.
const utcToLocalDate = (utcDate: Date, tz: string): string =>
  DateTime.fromJSDate(utcDate).setZone(tz).toFormat("yyyy-MM-dd");

// Returns the full weekday name (e.g. "Monday") for a UTC Date in the viewer's timezone.
const utcToLocalDay = (utcDate: Date, tz: string): string =>
  DateTime.fromJSDate(utcDate).setZone(tz).toFormat("cccc");

// Breaks any slot longer than 1 hour into consecutive 1-hour slots.
// Slots that are exactly 1 hour (or shorter) are kept as-is.
const splitIntoHourlySlots = (slots: ISlotInput[]): ISlotInput[] => {
  const result: ISlotInput[] = [];

  for (const slot of slots) {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal <= startTotal) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `End time must be after start time: ${slot.startTime} - ${slot.endTime}`,
      );
    }

    const toTime = (mins: number) =>
      `${Math.floor(mins / 60).toString().padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;

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
const groupSlotsByLocalDate = (slots: any[], tz: string) => {
  const grouped: Record<
    string,
    { _id?: any; day: string; date: string; slots: any[] }
  > = {};

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
const createAvailability = async (
  userId: string,
  payload: { availabilities: IAvailabilityInput[]; timezone?: string },
) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Teacher profile not found for this user",
    );
  }

  const teacherId = user.teacher;
  // Prefer payload timezone → user's saved timezone → UTC fallback
  const tz = payload.timezone || user.timezone || "UTC";

  const availabilityDoc = await AvailabilityModel.findOne({ teacherId });

  const existingSlots: any[] = availabilityDoc?.slots ?? [];

  const newUtcSlots: { startTime: Date; endTime: Date }[] = [];

  for (const item of payload.availabilities) {
    // Reject past dates based on the teacher's local timezone
    const todayLocal = DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
    if (item.date < todayLocal) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot create availability for a past date: ${item.date}`,
      );
    }

    // Split any multi-hour range into individual 1-hour booking units
    const hourlySlots = splitIntoHourlySlots(item.slots);

    for (const slot of hourlySlots) {
      const startUtc = localToUtcDate(item.date, slot.startTime, tz);
      const endUtc = localToUtcDate(item.date, slot.endTime, tz);

      // Skip if an identical slot already exists (idempotent re-submission)
      const isDuplicate = existingSlots.some(
        (s: any) =>
          new Date(s.startTime).getTime() === startUtc.getTime() &&
          new Date(s.endTime).getTime() === endUtc.getTime(),
      );
      if (isDuplicate) continue;

      // Prevent partial overlaps (e.g. 10:00–11:00 when 10:30–11:30 already exists)
      const hasOverlap = existingSlots.some(
        (s: any) =>
          startUtc < new Date(s.endTime) && endUtc > new Date(s.startTime),
      );
      if (hasOverlap) {
        throw new AppError(
          httpStatus.CONFLICT,
          `Slot ${slot.startTime}–${slot.endTime} on ${item.date} overlaps with an existing slot`,
        );
      }

      newUtcSlots.push({ startTime: startUtc, endTime: endUtc });
    }
  }

  if (newUtcSlots.length === 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      "All selected availability slots already exist.",
    );
  }

  if (!availabilityDoc) {
    // First-time setup: create the availability document and link it to the teacher
    const created = await AvailabilityModel.create({
      teacherId,
      timezone: tz,
      slots: newUtcSlots,
    });
    await TeacherModel.findByIdAndUpdate(teacherId, {
      $push: { availabilities: created._id },
    });
    return created;
  }

  // Append new slots to the existing availability document
  availabilityDoc.slots.push(...newUtcSlots);
  await availabilityDoc.save();
  return availabilityDoc;
};

// Returns the teacher's own future availability slots grouped by local date.
// Past slots (startTime < now) are filtered out before returning.
const getMyAvailability = async (userId: string, viewerTimezone?: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Teacher profile not found for this user",
    );
  }

  const tz = viewerTimezone || user.timezone || "UTC";
  const nowUtc = DateTime.now().toUTC().toJSDate();

  const availabilityDocs = await AvailabilityModel.find({
    teacherId: user.teacher,
  });
  if (!availabilityDocs.length) return [];

  // Flatten all docs into a single slot list, attaching the parent doc _id so
  // the client can reference it for updates/deletes
  const allSlots: any[] = availabilityDocs.flatMap((doc) =>
    (doc.slots as any[])
      .filter((s) => new Date(s.startTime) >= nowUtc)
      .map((s) => ({ ...s.toObject(), availabilityId: doc._id })),
  );

  allSlots.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const result = groupSlotsByLocalDate(allSlots, tz);

  return result;
};

// Updates a single slot's start/end time or isBooked flag.
// Time updates are validated against the teacher's timezone and checked for
// overlaps with sibling slots in the same availability document.
const updateSlot = async (
  userId: string,
  availabilityId: string,
  slotId: string,
  payload: {
    startTime?: string;
    endTime?: string;
    isBooked?: boolean;
    timezone?: string;
  },
) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Teacher profile not found for this user",
    );
  }

  const availability = await AvailabilityModel.findOne({
    _id: availabilityId,
    teacherId: user.teacher,
  });
  if (!availability) {
    throw new AppError(httpStatus.NOT_FOUND, "Availability not found");
  }

  const slot = (availability.slots as Types.DocumentArray<any>).id(slotId);
  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, "Slot not found");
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
    const otherSlots = (availability.slots as any[]).filter(
      (s) => String(s._id) !== slotId,
    );

    const hasOverlap = otherSlots.some(
      (s) =>
        newStartUtc < new Date(s.endTime) && newEndUtc > new Date(s.startTime),
    );
    if (hasOverlap) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Updated slot overlaps with an existing slot",
      );
    }

    slot.startTime = newStartUtc;
    slot.endTime = newEndUtc;
  }

  if (payload.isBooked !== undefined) slot.isBooked = payload.isBooked;

  await availability.save();
  return availability;
};

// Deletes a single unbooked slot. If it was the last slot in the availability
// document, the entire document is also deleted to avoid orphaned records.
const deleteSlot = async (
  userId: string,
  availabilityId: string,
  slotId: string,
) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Teacher profile not found for this user",
    );
  }

  const availability = await AvailabilityModel.findOne({
    _id: availabilityId,
    teacherId: user.teacher,
  });
  if (!availability) {
    throw new AppError(httpStatus.NOT_FOUND, "Availability not found");
  }

  const slot = (availability.slots as Types.DocumentArray<any>).id(slotId);
  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, "Slot not found");
  }

  // Booked slots cannot be deleted — cancellation must go through the booking flow
  if (slot.isBooked) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot delete a booked slot");
  }

  slot.deleteOne();

  if (availability.slots.length === 0) {
    await availability.deleteOne();
    return null;
  }

  await availability.save();
  return availability;
};

// Finds all teachers who have an available (unbooked) slot at the exact UTC time
// that corresponds to the given local date + time in the viewer's timezone.
const searchTeachersByAvailability = async (
  date: string,
  time: string,
  viewerTimezone?: string,
) => {
  const tz = viewerTimezone || "UTC";
  const todayLocal = DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");

  if (date < todayLocal) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot search availability for past dates",
    );
  }

  const targetUtc = localToUtcDate(date, time, tz);

  const availabilities = await AvailabilityModel.find({
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
    const slot = (obj.slots as any[]).find(
      (s) =>
        new Date(s.startTime).getTime() === targetUtc.getTime() && !s.isBooked,
    );

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
};

// Returns all teachers with future availability, grouped by local date in the
// viewer's timezone. Multiple availability documents per teacher are merged into
// a single slot list before grouping so the response is one entry per teacher per date.
const getAllAvailability = async (viewerTimezone?: string) => {
  const tz = viewerTimezone || "UTC";
  const nowUtc = DateTime.now().toUTC().toJSDate();

  const availabilities = await AvailabilityModel.find().populate(
    "teacherId",
    "name email nationality experience aboutMe interests languages profilePicture",
  );

  const validAvailabilities = availabilities.filter((a) => a.teacherId != null);

  // Merge all availability docs for the same teacher into one slot pool
  const byTeacher = new Map<string, { teacher: any; slots: any[] }>();

  for (const availability of validAvailabilities) {
    const obj = availability.toObject();
    const teacherKey = String((obj.teacherId as any)._id ?? obj.teacherId);

    if (!byTeacher.has(teacherKey)) {
      byTeacher.set(teacherKey, { teacher: obj.teacherId, slots: [] });
    }

    const futureSlots = (obj.slots as any[]).filter(
      (s) => new Date(s.startTime) >= nowUtc,
    );

    byTeacher.get(teacherKey)!.slots.push(...futureSlots);
  }

  const result: any[] = [];

  for (const { teacher, slots } of byTeacher.values()) {
    // Skip teachers who have no upcoming slots after filtering
    if (slots.length === 0) continue;

    slots.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const grouped = groupSlotsByLocalDate(slots, tz);
    for (const group of grouped) {
      result.push({ teacher, ...group });
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
};

export const NewAvailabilityService = {
  createAvailability,
  getMyAvailability,
  updateSlot,
  deleteSlot,
  searchTeachersByAvailability,
  getAllAvailability,
};
