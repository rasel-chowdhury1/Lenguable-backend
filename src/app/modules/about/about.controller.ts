import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IAbout } from "./about.interface";
import { AboutServices } from "./about.service";

const createAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Parse stats JSON string sent via FormData
    if (req.body.stats && typeof req.body.stats === "string") {
      req.body.stats = JSON.parse(req.body.stats);
    }

    const payload: IAbout = {
      ...req.body,
      image: (req.file as Express.Multer.File).path,
    };
    const result = await AboutServices.createAbout(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "About section created successfully",
      data: result,
    });
  },
);

const getAllAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AboutServices.getAllAbout();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "About sections retrieved successfully",
      data: result,
    });
  },
);

const getAboutById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AboutServices.getAboutById(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "About section retrieved successfully",
      data: result,
    });
  },
);

const updateAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Parse stats JSON string sent via FormData
    if (req.body.stats && typeof req.body.stats === "string") {
      req.body.stats = JSON.parse(req.body.stats);
    }

    const payload: Partial<IAbout> = {
      ...req.body,
      ...(req.file && { image: (req.file as Express.Multer.File).path }),
    };
    const result = await AboutServices.updateAbout(req.params.id, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "About section updated successfully",
      data: result,
    });
  },
);

const deleteAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AboutServices.deleteAbout(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "About section deleted successfully",
      data: result,
    });
  },
);

export const AboutController = {
  createAbout,
  getAllAbout,
  getAboutById,
  updateAbout,
  deleteAbout,
};
