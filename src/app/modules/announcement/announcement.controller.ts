import { Request, Response } from "express";
import { AnnouncementService } from "./announcement.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementService.createAnnouncement(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Announcement created successfully",
    data: result,
  });
});

const getAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementService.getAnnouncement();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement retrieved successfully",
    data: result,
  });
});

const updateAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AnnouncementService.updateAnnouncement(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement updated successfully",
    data: result,
  });
});

const deleteAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AnnouncementService.deleteAnnouncement(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Announcement deleted successfully",
    data: result,
  });
});

export const AnnouncementController = {
  createAnnouncement,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
