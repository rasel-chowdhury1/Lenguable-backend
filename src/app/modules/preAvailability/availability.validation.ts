import z from "zod";

const slotSchema = z.object({
  startTime: z.string({ required_error: "Start time is required" }),
  endTime: z.string({ required_error: "End time is required" }),
});

const singleAvailabilitySchema = z.object({
  day: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  date: z
    .string({ required_error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  slots: z.array(slotSchema).min(1, "At least one slot is required"),
});

export const createAvailabilitySchema = z.object({
  availabilities: z
    .array(singleAvailabilitySchema)
    .min(1, "At least one availability is required"),
});

export const updateSlotSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isBooked: z.boolean().optional(),
});
