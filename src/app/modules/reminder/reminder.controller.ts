import { Request, Response } from "express";
import { ReminderService } from "./reminder.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const sendReminder = catchAsync(async (req: Request, res: Response) => {
  const { timeLabel } = req.body; // "24h" or "2h"

  if (!["24h", "2h"].includes(timeLabel)) {
    res.status(400).json({ message: 'timeLabel must be "24h" or "2h"' });
    return;
  }

  const result = await ReminderService.sendReminderEmails(timeLabel);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Reminder emails sent successfully to ${result.sentCount} booking(s)`,
    data: result,
  });
});

export const ReminderController = { sendReminder };