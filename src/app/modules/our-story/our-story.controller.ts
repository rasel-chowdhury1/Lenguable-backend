import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { IOurStory } from "./our-story.interface";
import { OurStoryServices } from "./our-story.service";
import { sendResponse } from "../../utils/sendResponse";

const createOurStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: IOurStory = {
      ...req.body,
      founderImage: (req.file as Express.Multer.File).path,
    };
    const result = await OurStoryServices.createOurStory(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Our Story section created successfully",
      data: result,
    });
  },
);

const getAllOurStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await OurStoryServices.getAllOurStory();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Our Story sections retrieved successfully",
      data: result,
    });
  },
);

const getOurStoryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await OurStoryServices.getOurStoryById(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Our Story section retrieved successfully",
      data: result,
    });
  },
);

const updateOurStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: Partial<IOurStory> = {
      ...req.body,
      ...(req.file && { founderImage: (req.file as Express.Multer.File).path }),
    };
    const result = await OurStoryServices.updateOurStory(
      req.params.id,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Our Story section updated successfully",
      data: result,
    });
  },
);

const deleteOurStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await OurStoryServices.deleteOurStory(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Our Story section deleted successfully",
      data: result,
    });
  },
);

export const OurStoryController = {
  createOurStory,
  getAllOurStory,
  getOurStoryById,
  updateOurStory,
  deleteOurStory,
};
