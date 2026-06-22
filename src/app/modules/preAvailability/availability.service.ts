// import { Types } from "mongoose";
// import AppError from "../../helpers/AppError";
// import { TeacherModel } from "../teacher/teacher.model";
// import { UserModel } from "../user/user.model";
// import { IAvailabilityInput } from "./availability.interface";
// import { AvailabilityModel } from "./availability.model";
// import httpStatus from "http-status-codes";
// import { localToUtc, utcToLocal } from "../../utils/timezone";

// const convertAvailabilitiesToTimezone = (availabilities: any[], tz: string) => {
//   return availabilities.map((avail) => {
//     const obj = avail.toObject ? avail.toObject() : avail;

//     const slots = obj.slots.map((slot: any) => {
//       const start = utcToLocal(slot.startTime, obj.date, tz);
//       const end = utcToLocal(slot.endTime, obj.date, tz);
//       return {
//         ...slot,
//         startTime: start.isoDate,
//         endTime: end.isoDate,
//       };
//     });

//     const firstSlotIso = slots[0]?.startTime;
//     const localDate = firstSlotIso
//       ? new Date(firstSlotIso).toLocaleDateString("en-CA", { timeZone: tz })
//       : obj.date;
//     const localDay = firstSlotIso
//       ? new Date(firstSlotIso).toLocaleDateString("en-US", {
//           timeZone: tz,
//           weekday: "long",
//         })
//       : obj.day;

//     return {
//       ...obj,
//       date: localDate,
//       day: localDay,
//       slots,
//     };
//   });
// };

// const createAvailability = async (
//   userId: string,
//   payload: { availabilities: IAvailabilityInput[]; timezone?: string },
// ) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }

//   const teacherId = user.teacher;
//   const tz = payload.timezone || user.timezone || "UTC";
//   const createdOrUpdated = [];

//   for (const item of payload.availabilities) {
//     const todayUTC = new Date().toISOString().split("T")[0];
//     const { utcDate: checkDate } = localToUtc(
//       item.slots[0].startTime,
//       item.date,
//       tz,
//     );
//     if (checkDate < todayUTC) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         `Cannot create availability for a past date: ${item.date}`,
//       );
//     }

//     const utcSlots = item.slots.map((slot) => {
//       const start = localToUtc(slot.startTime, item.date, tz);
//       const end = localToUtc(slot.endTime, item.date, tz);
//       return { startTime: start.utcTime, endTime: end.utcTime };
//     });

//     const { utcDate, utcDay } = localToUtc(
//       item.slots[0].startTime,
//       item.date,
//       tz,
//     );

//     const existing = await AvailabilityModel.findOne({
//       teacherId,
//       date: utcDate,
//     });

//     if (existing) {
//       const newSlots = utcSlots.filter(
//         (slot) =>
//           !existing.slots.some(
//             (s) => s.startTime === slot.startTime && s.endTime === slot.endTime,
//           ),
//       );

//       if (newSlots.length === 0) {
//         throw new AppError(
//           httpStatus.CONFLICT,
//           `All slots already exist for ${item.date}`,
//         );
//       }

//       existing.slots.push(...newSlots);
//       await existing.save();
//       createdOrUpdated.push(existing);
//     } else {
//       const created = await AvailabilityModel.create({
//         teacherId,
//         day: utcDay,
//         date: utcDate,
//         slots: utcSlots,
//       });
//       createdOrUpdated.push(created);
//       await TeacherModel.findByIdAndUpdate(teacherId, {
//         $push: { availabilities: created._id },
//       });
//     }
//   }

//   return createdOrUpdated;
// };

// const getMyAvailability = async (userId: string, viewerTimezone?: string) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }
//   const tz = viewerTimezone || user.timezone || "UTC";

//   const todayUTC = new Date().toISOString().split("T")[0];

//   const availabilities = await AvailabilityModel.find({
//     teacherId: user.teacher,
//     date: { $gte: todayUTC },
//   }).sort({ date: 1 });

//   const converted = convertAvailabilitiesToTimezone(availabilities, tz);

//   const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
//   return converted.filter((item) => item.date >= todayLocal);
// };

// const updateSlot = async (
//   userId: string,
//   availabilityId: string,
//   slotId: string,
//   payload: {
//     startTime?: string;
//     endTime?: string;
//     isBooked?: boolean;
//     timezone?: string;
//   },
// ) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }

//   const tz = payload.timezone || user.timezone || "UTC";

//   const availability = await AvailabilityModel.findOne({
//     _id: availabilityId,
//     teacherId: user.teacher,
//   });

//   if (!availability) {
//     throw new AppError(httpStatus.NOT_FOUND, "Availability not found");
//   }

//   const slot = (availability.slots as Types.DocumentArray<any>).id(slotId);
//   if (!slot) {
//     throw new AppError(httpStatus.NOT_FOUND, "Slot not found");
//   }

//   if (payload.startTime) {
//     const converted = localToUtc(payload.startTime, availability.date, tz);
//     slot.startTime = converted.utcTime;
//   }
//   if (payload.endTime) {
//     const converted = localToUtc(payload.endTime, availability.date, tz);
//     slot.endTime = converted.utcTime;
//   }
//   if (payload.isBooked !== undefined) slot.isBooked = payload.isBooked;

//   await availability.save();
//   return availability;
// };

// const deleteSlot = async (
//   userId: string,
//   availabilityId: string,
//   slotId: string,
// ) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }

//   const availability = await AvailabilityModel.findOne({
//     _id: availabilityId,
//     teacherId: user.teacher,
//   });

//   if (!availability) {
//     throw new AppError(httpStatus.NOT_FOUND, "Availability not found");
//   }

//   const slot = (availability.slots as Types.DocumentArray<any>).id(slotId);
//   if (!slot) {
//     throw new AppError(httpStatus.NOT_FOUND, "Slot not found");
//   }

//   if (slot.isBooked) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Cannot delete a booked slot");
//   }

//   slot.deleteOne();

//   if (availability.slots.length === 0) {
//     await availability.deleteOne();
//     return null;
//   }

//   await availability.save();
//   return availability;
// };

// const searchTeachersByAvailability = async (
//   date: string,
//   time: string,
//   viewerTimezone?: string,
// ) => {
//   const tz = viewerTimezone || "UTC";

//   const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
//   if (date < todayLocal) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Cannot search availability for past dates",
//     );
//   }

//   const { utcDate, utcTime } = (() => {
//     const converted = localToUtc(time, date, tz);
//     return { utcDate: converted.utcDate, utcTime: converted.utcTime };
//   })();

//   const availabilities = await AvailabilityModel.find({
//     date: utcDate,
//     slots: { $elemMatch: { startTime: utcTime, isBooked: false } },
//   }).populate("teacherId", "name email nationality experience profilePicture");

//   const validAvailabilities = availabilities.filter((a) => a.teacherId != null);

//   return validAvailabilities.map((availability) => {
//     const obj = availability.toObject();
//     const slot = obj.slots.find((s) => s.startTime === utcTime && !s.isBooked);
//     const convertedSlot = slot
//       ? {
//           ...slot,
//           startTime: utcToLocal(slot.startTime, obj.date, tz).isoDate,
//           endTime: utcToLocal(slot.endTime, obj.date, tz).isoDate,
//         }
//       : slot;
//     const converted = utcToLocal(utcTime, obj.date, tz);
//     return {
//       teacher: obj.teacherId,
//       date: converted.localDate,
//       day: converted.localDay,
//       slot: convertedSlot,
//     };
//   });
// };

// const getAllAvailability = async (viewerTimezone?: string) => {
//   const tz = viewerTimezone || "UTC";

//   const todayUTC = new Date().toISOString().split("T")[0];

//   const availabilities = await AvailabilityModel.find({
//     date: { $gte: todayUTC },
//   })
//     .sort({ date: 1 })
//     .populate(
//       "teacherId",
//       "name email nationality experience aboutMe interests languages profilePicture",
//     );

//   const validAvailabilities = availabilities.filter((a) => a.teacherId != null);

//   const converted = convertAvailabilitiesToTimezone(validAvailabilities, tz);

//   const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
//   return converted.filter((item) => item.date >= todayLocal);
// };

// export const AvailabilityService = {
//   createAvailability,
//   getMyAvailability,
//   updateSlot,
//   deleteSlot,
//   searchTeachersByAvailability,
//   getAllAvailability,
// };

// import { Types } from "mongoose";
// import AppError from "../../helpers/AppError";
// import { TeacherModel } from "../teacher/teacher.model";
// import { UserModel } from "../user/user.model";
// import { IAvailabilityInput, ISlot } from "./availability.interface";
// import { AvailabilityModel } from "./availability.model";
// import httpStatus from "http-status-codes";
// import { localToUtc, utcToLocal } from "../../utils/timezone";

// // Add this helper before createAvailability
// const splitIntoHourlySlots = (slots: ISlot[]): ISlot[] => {
//   const result: ISlot[] = [];

//   for (const slot of slots) {
//     const [startH, startM] = slot.startTime.split(":").map(Number);
//     const [endH, endM] = slot.endTime.split(":").map(Number);

//     const startTotal = startH * 60 + startM;
//     const endTotal = endH * 60 + endM;

//     if (endTotal - startTotal <= 60) {
//       // Already 1 hour or less, keep as-is
//       result.push(slot);
//       continue;
//     }

//     // Split into 1-hour chunks
//     let current = startTotal;
//     while (current + 60 <= endTotal) {
//       const next = current + 60;
//       const toTime = (mins: number) =>
//         `${Math.floor(mins / 60)
//           .toString()
//           .padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;
//       result.push({ startTime: toTime(current), endTime: toTime(next) });
//       current = next;
//     }
//   }

//   return result;
// };

// const convertAvailabilitiesToTimezone = (availabilities: any[], tz: string) => {
//   return availabilities.map((avail) => {
//     const obj = avail.toObject ? avail.toObject() : avail;

//     const slots = obj.slots.map((slot: any) => {
//       const start = utcToLocal(slot.startTime, obj.date, tz);
//       const end = utcToLocal(slot.endTime, obj.date, tz);
//       return {
//         ...slot,
//         startTime: start.isoDate,
//         endTime: end.isoDate,
//       };
//     });

//     const firstSlotIso = slots[0]?.startTime;
//     const localDate = firstSlotIso
//       ? new Date(firstSlotIso).toLocaleDateString("en-CA", { timeZone: tz })
//       : obj.date;
//     const localDay = firstSlotIso
//       ? new Date(firstSlotIso).toLocaleDateString("en-US", {
//           timeZone: tz,
//           weekday: "long",
//         })
//       : obj.day;

//     return {
//       ...obj,
//       date: localDate,
//       day: localDay,
//       slots,
//     };
//   });
// };

// const createAvailability = async (
//   userId: string,
//   payload: { availabilities: IAvailabilityInput[]; timezone?: string },
// ) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }

//   const teacherId = user.teacher;
//   const tz = payload.timezone || user.timezone || "UTC";
//   const createdOrUpdated = [];

//   for (let item of payload.availabilities) {
//     // Split FIRST (still in local time)
//     const hourlySlots = splitIntoHourlySlots(item.slots);
//     item = { ...item, slots: hourlySlots };

//     const todayUTC = new Date().toISOString().split("T")[0];
//     const { utcDate: checkDate } = localToUtc(
//       item.slots[0].startTime,
//       item.date,
//       tz,
//     );
//     if (checkDate < todayUTC) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         `Cannot create availability for a past date: ${item.date}`,
//       );
//     }

//     // Convert each hourly slot to UTC
//     const utcSlots = item.slots.map((slot) => {
//       const start = localToUtc(slot.startTime, item.date, tz);
//       const end = localToUtc(slot.endTime, item.date, tz);
//       return { startTime: start.utcTime, endTime: end.utcTime };
//     });

//     const { utcDate, utcDay } = localToUtc(
//       item.slots[0].startTime,
//       item.date,
//       tz,
//     );

//     const existing = await AvailabilityModel.findOne({
//       teacherId,
//       date: utcDate,
//     });

//     if (existing) {
//       // Filter out only truly duplicate UTC slots
//       const newSlots = utcSlots.filter(
//         (slot) =>
//           !existing.slots.some(
//             (s) => s.startTime === slot.startTime && s.endTime === slot.endTime,
//           ),
//       );

//       if (newSlots.length === 0) {
//         continue; // silently skip, all slots already exist
//       }

//       existing.slots.push(...newSlots);
//       await existing.save();
//       createdOrUpdated.push(existing);
//     } else {
//       const created = await AvailabilityModel.create({
//         teacherId,
//         day: utcDay,
//         date: utcDate,
//         slots: utcSlots,
//       });
//       createdOrUpdated.push(created);
//       await TeacherModel.findByIdAndUpdate(teacherId, {
//         $push: { availabilities: created._id },
//       });
//     }
//   }

//   return createdOrUpdated;
// };

// const getMyAvailability = async (userId: string, viewerTimezone?: string) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }
//   const tz = viewerTimezone || user.timezone || "UTC";

//   const todayUTC = new Date().toISOString().split("T")[0];

//   const availabilities = await AvailabilityModel.find({
//     teacherId: user.teacher,
//     date: { $gte: todayUTC },
//   }).sort({ date: 1 });

//   const converted = convertAvailabilitiesToTimezone(availabilities, tz);

//   const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
//   return converted.filter((item) => item.date >= todayLocal);
// };

// const updateSlot = async (
//   userId: string,
//   availabilityId: string,
//   slotId: string,
//   payload: {
//     startTime?: string;
//     endTime?: string;
//     isBooked?: boolean;
//     timezone?: string;
//   },
// ) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }

//   const tz = payload.timezone || user.timezone || "UTC";

//   const availability = await AvailabilityModel.findOne({
//     _id: availabilityId,
//     teacherId: user.teacher,
//   });

//   if (!availability) {
//     throw new AppError(httpStatus.NOT_FOUND, "Availability not found");
//   }

//   const slot = (availability.slots as Types.DocumentArray<any>).id(slotId);
//   if (!slot) {
//     throw new AppError(httpStatus.NOT_FOUND, "Slot not found");
//   }

//   if (payload.startTime) {
//     const converted = localToUtc(payload.startTime, availability.date, tz);
//     slot.startTime = converted.utcTime;
//   }
//   if (payload.endTime) {
//     const converted = localToUtc(payload.endTime, availability.date, tz);
//     slot.endTime = converted.utcTime;
//   }
//   if (payload.isBooked !== undefined) slot.isBooked = payload.isBooked;

//   await availability.save();
//   return availability;
// };

// const deleteSlot = async (
//   userId: string,
//   availabilityId: string,
//   slotId: string,
// ) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       "Teacher profile not found for this user",
//     );
//   }

//   const availability = await AvailabilityModel.findOne({
//     _id: availabilityId,
//     teacherId: user.teacher,
//   });

//   if (!availability) {
//     throw new AppError(httpStatus.NOT_FOUND, "Availability not found");
//   }

//   const slot = (availability.slots as Types.DocumentArray<any>).id(slotId);
//   if (!slot) {
//     throw new AppError(httpStatus.NOT_FOUND, "Slot not found");
//   }

//   if (slot.isBooked) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Cannot delete a booked slot");
//   }

//   slot.deleteOne();

//   if (availability.slots.length === 0) {
//     await availability.deleteOne();
//     return null;
//   }

//   await availability.save();
//   return availability;
// };

// const searchTeachersByAvailability = async (
//   date: string,
//   time: string,
//   viewerTimezone?: string,
// ) => {
//   const tz = viewerTimezone || "UTC";

//   const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
//   if (date < todayLocal) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Cannot search availability for past dates",
//     );
//   }

//   const { utcDate, utcTime } = (() => {
//     const converted = localToUtc(time, date, tz);
//     return { utcDate: converted.utcDate, utcTime: converted.utcTime };
//   })();

//   const availabilities = await AvailabilityModel.find({
//     date: utcDate,
//     slots: { $elemMatch: { startTime: utcTime, isBooked: false } },
//   }).populate("teacherId", "name email nationality experience profilePicture");

//   const validAvailabilities = availabilities.filter((a) => a.teacherId != null);

//   return validAvailabilities.map((availability) => {
//     const obj = availability.toObject();
//     const slot = obj.slots.find((s) => s.startTime === utcTime && !s.isBooked);
//     const convertedSlot = slot
//       ? {
//           ...slot,
//           startTime: utcToLocal(slot.startTime, obj.date, tz).isoDate,
//           endTime: utcToLocal(slot.endTime, obj.date, tz).isoDate,
//         }
//       : slot;
//     const converted = utcToLocal(utcTime, obj.date, tz);
//     return {
//       teacher: obj.teacherId,
//       date: converted.localDate,
//       day: converted.localDay,
//       slot: convertedSlot,
//     };
//   });
// };

// const getAllAvailability = async (viewerTimezone?: string) => {
//   const tz = viewerTimezone || "UTC";

//   const todayUTC = new Date().toISOString().split("T")[0];

//   const availabilities = await AvailabilityModel.find({
//     date: { $gte: todayUTC },
//   })
//     .sort({ date: 1 })
//     .populate(
//       "teacherId",
//       "name email nationality experience aboutMe interests languages profilePicture",
//     );

//   const validAvailabilities = availabilities.filter((a) => a.teacherId != null);

//   const converted = convertAvailabilitiesToTimezone(validAvailabilities, tz);

//   const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
//   return converted.filter((item) => item.date >= todayLocal);
// };

// export const AvailabilityService = {
//   createAvailability,
//   getMyAvailability,
//   updateSlot,
//   deleteSlot,
//   searchTeachersByAvailability,
//   getAllAvailability,
// };

import { Types } from "mongoose";
import AppError from "../../helpers/AppError";
import { TeacherModel } from "../teacher/teacher.model";
import { UserModel } from "../user/user.model";
import { IAvailabilityInput, ISlot } from "./availability.interface";
import { AvailabilityModel } from "./availability.model";
import httpStatus from "http-status-codes";
import { localToUtc, utcToLocal } from "../../utils/timezone";
import { DateTime } from "luxon";

const splitIntoHourlySlots = (slots: ISlot[]): ISlot[] => {
  const result: ISlot[] = [];

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
      const toTime = (mins: number) =>
        `${Math.floor(mins / 60)
          .toString()
          .padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;
      result.push({ startTime: toTime(current), endTime: toTime(next) });
      current = next;
    }
  }

  return result;
};

const convertAvailabilitiesToTimezone = (availabilities: any[], tz: string) => {
  return availabilities.map((avail) => {


    const obj = avail.toObject ? avail.toObject() : avail;

    const slots = obj.slots.map((slot: any) => {
      const start = utcToLocal(slot.startTime, obj.date, tz);
      const end = utcToLocal(slot.endTime, obj.date, tz);
      return {
        ...slot,
        startTime: start.isoDate,
        endTime: end.isoDate,
      };
    });





    const firstSlotIso = slots[0]?.startTime;
    const localDate = firstSlotIso
      ? new Date(firstSlotIso).toLocaleDateString("en-CA", { timeZone: tz })
      : obj.date;
    const localDay = firstSlotIso
      ? new Date(firstSlotIso).toLocaleDateString("en-US", {
        timeZone: tz,
        weekday: "long",
      })
      : obj.day;



    return {
      ...obj,
      date: avail.date,
      day: avail.day,
      slots,
    };
  });
};



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
  const tz = payload.timezone || user.timezone || "UTC";
  const createdOrUpdated = [];
  let allDuplicates = true;

  for (let item of payload.availabilities) {
    const hourlySlots = splitIntoHourlySlots(item.slots);
    item = { ...item, slots: hourlySlots };

    const todayUTC = new Date().toISOString().split("T")[0];

    const { utcDate: checkDate } = localToUtc(
      item.slots[0].startTime,
      item.date,
      tz,
    );

    if (checkDate < todayUTC) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot create availability for a past date: ${item.date}`,
      );
    }

    const utcSlots = item.slots.map((slot) => {
      const start = localToUtc(slot.startTime, item.date, tz);
      const end = localToUtc(slot.endTime, item.date, tz);
      return { startTime: start.utcTime, endTime: end.utcTime };
    });

    const { utcDate, utcDay } = localToUtc(
      item.slots[0].startTime,
      item.date,
      tz,
    );


    const existing = await AvailabilityModel.findOne({
      teacherId,
      date: item.date,
    });

    if (existing) {
      const newSlots = utcSlots.filter(
        (slot) =>
          !existing.slots.some(
            (s) => s.startTime === slot.startTime && s.endTime === slot.endTime,
          ),
      );

      if (newSlots.length === 0) {
        continue;
      }

      allDuplicates = false;
      existing.slots.push(...newSlots);
      await existing.save();
      createdOrUpdated.push(existing);
    } else {
      allDuplicates = false;

   const created = await AvailabilityModel.create({
  teacherId,
  day: item.day,
  date: item.date,

  utcDate: DateTime.fromISO(item.date, {
    zone: tz,
  })
    .startOf("day")
    .toUTC()
    .toJSDate(),

  slots: utcSlots,
});

      createdOrUpdated.push(created);
      await TeacherModel.findByIdAndUpdate(teacherId, {
        $push: { availabilities: created._id },
      });
    }
  }

  if (allDuplicates) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This time slot already exists for the selected date",
    );
  }

  return createdOrUpdated;
};

const getMyAvailability = async (userId: string, viewerTimezone?: string) => {


  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Teacher profile not found for this user",
    );
  }

  const tz = viewerTimezone || user.timezone || "UTC";
  // const todayUTC = new Date().toISOString().split("T")[0];

  const todayUTC = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
  }).format(new Date());



  const availabilities = await AvailabilityModel.find({
    teacherId: user.teacher,
    date: { $gte: todayUTC },
  }).sort({ date: 1 });


  const converted = convertAvailabilitiesToTimezone(availabilities, tz);

  const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });



  const result = converted.filter((item) => item.date >= todayLocal);


  return result;
};

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

  const tz = payload.timezone || user.timezone || "UTC";

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

  if (payload.startTime) {
    const converted = localToUtc(payload.startTime, availability.date, tz);
    slot.startTime = converted.utcTime;
  }
  if (payload.endTime) {
    const converted = localToUtc(payload.endTime, availability.date, tz);
    slot.endTime = converted.utcTime;
  }
  if (payload.isBooked !== undefined) slot.isBooked = payload.isBooked;

  await availability.save();
  return availability;
};

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

const searchTeachersByAvailability = async (
  date: string,
  time: string,
  viewerTimezone?: string,
) => {
  const tz = viewerTimezone || "UTC";

  const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  if (date < todayLocal) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot search availability for past dates",
    );
  }

  const { utcDate, utcTime } = (() => {
    const converted = localToUtc(time, date, tz);
    return { utcDate: converted.utcDate, utcTime: converted.utcTime };
  })();

  const availabilities = await AvailabilityModel.find({
    date: utcDate,
    slots: { $elemMatch: { startTime: utcTime, isBooked: false } },
  }).populate("teacherId", "name email nationality experience profilePicture");

  const validAvailabilities = availabilities.filter((a) => a.teacherId != null);

  return validAvailabilities.map((availability) => {
    const obj = availability.toObject();
    const slot = obj.slots.find((s) => s.startTime === utcTime && !s.isBooked);
    const convertedSlot = slot
      ? {
        ...slot,
        startTime: utcToLocal(slot.startTime, obj.date, tz).isoDate,
        endTime: utcToLocal(slot.endTime, obj.date, tz).isoDate,
      }
      : slot;
    const converted = utcToLocal(utcTime, obj.date, tz);
    return {
      teacher: obj.teacherId,
      date: converted.localDate,
      day: converted.localDay,
      slot: convertedSlot,
    };
  });
};

const getAllAvailability = async (viewerTimezone?: string) => {
  const tz = viewerTimezone || "UTC";

  const todayUTC = new Date().toISOString().split("T")[0];

  const availabilities = await AvailabilityModel.find({
    date: { $gte: todayUTC },
  })
    .sort({ date: 1 })
    .populate(
      "teacherId",
      "name email nationality experience aboutMe interests languages profilePicture",
    );

  const validAvailabilities = availabilities.filter((a) => a.teacherId != null);

  const converted = convertAvailabilitiesToTimezone(validAvailabilities, tz);

  const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  return converted.filter((item) => item.date >= todayLocal);
};

export const AvailabilityService = {
  createAvailability,
  getMyAvailability,
  updateSlot,
  deleteSlot,
  searchTeachersByAvailability,
  getAllAvailability,
};
