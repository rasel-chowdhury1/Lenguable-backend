import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { AvailabilityService } from "./availability.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const timezone = req.query.timezone as string | undefined;

  console.log("req query =>>>> ", req.query)
  console.log("Time zone =>>>>> ", timezone)
  const result = await AvailabilityService.createAvailability(userId, {
    ...req.body,
    timezone,
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Availabilities created successfully",
    data: result,
  });
});

const getMyAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const timezone = req.query.timezone as string | undefined;
  const result = await AvailabilityService.getMyAvailability(userId, timezone);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability retrieved successfully",
    data: result,
  });
});

const updateSlot = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { availabilityId, slotId } = req.params;
  const timezone = req.query.timezone as string | undefined;
  const result = await AvailabilityService.updateSlot(
    userId,
    availabilityId,
    slotId,
    { ...req.body, timezone },
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Slot updated successfully",
    data: result,
  });
});

const deleteSlot = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { availabilityId, slotId } = req.params;
  const result = await AvailabilityService.deleteSlot(
    userId,
    availabilityId,
    slotId,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Slot deleted successfully",
    data: result,
  });
});

const searchTeachers = catchAsync(async (req: Request, res: Response) => {
  const { date, time, timezone } = req.query;
  const result = await AvailabilityService.searchTeachersByAvailability(
    date as string,
    time as string,
    timezone as string | undefined,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Available teachers retrieved successfully",
    data: result,
  });
});

const getAllAvailability = catchAsync(async (req: Request, res: Response) => {
  const timezone = req.query.timezone as string | undefined;
  const result = await AvailabilityService.getAllAvailability(timezone);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All availability retrieved successfully",
    data: result,
  });
});

export const AvailabilityController = {
  createAvailability,
  getMyAvailability,
  updateSlot,
  deleteSlot,
  searchTeachers,
  getAllAvailability,
};
