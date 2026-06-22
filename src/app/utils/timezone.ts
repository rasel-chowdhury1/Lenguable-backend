import { fromZonedTime } from "date-fns-tz";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function localToUtc(
  time: string,
  date: string,
  timezone: string,
): { utcTime: string; utcDate: string; utcDay: string } {
  let utc: Date;

  if (time.includes("T")) {
    utc = new Date(time);
  } else {
    const localDate = new Date(`${date}T${time}:00`);
    utc = fromZonedTime(localDate, timezone);
    utc = fromZonedTime(`${date}T${time}:00`, timezone);
  }

  return {
    utcTime: `${pad(utc.getUTCHours())}:${pad(utc.getUTCMinutes())}`,
    utcDate: `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`,
    utcDay: DAYS[utc.getUTCDay()],
  };
}

export function utcToLocal(
  time: string,
  date: string,
  timezone: string,
): { localTime: string; localDate: string; localDay: string; isoDate: string } {
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
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value || "00";

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