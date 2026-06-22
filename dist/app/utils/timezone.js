"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localToUtc = localToUtc;
exports.utcToLocal = utcToLocal;
const date_fns_tz_1 = require("date-fns-tz");
const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
const pad = (n) => String(n).padStart(2, "0");
function localToUtc(time, date, timezone) {
    let utc;
    if (time.includes("T")) {
        utc = new Date(time);
    }
    else {
        const localDate = new Date(`${date}T${time}:00`);
        utc = (0, date_fns_tz_1.fromZonedTime)(localDate, timezone);
        utc = (0, date_fns_tz_1.fromZonedTime)(`${date}T${time}:00`, timezone);
    }
    return {
        utcTime: `${pad(utc.getUTCHours())}:${pad(utc.getUTCMinutes())}`,
        utcDate: `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`,
        utcDay: DAYS[utc.getUTCDay()],
    };
}
function utcToLocal(time, date, timezone) {
    const utcDate = time.includes("T")
        ? new Date(time)
        : new Date(`${date}T${time}:00.000Z`);
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    const parts = formatter.formatToParts(utcDate);
    const get = (type) => { var _a; return ((_a = parts.find((p) => p.type === type)) === null || _a === void 0 ? void 0 : _a.value) || "00"; };
    const localDate = `${get("year")}-${get("month")}-${get("day")}`;
    const localTime = `${get("hour")}:${get("minute")}`;
    const dayFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "long",
    });
    return {
        localTime,
        localDate,
        localDay: dayFormatter.format(utcDate),
        isoDate: utcDate.toISOString(),
    };
}
