import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IHowItWorks } from "./howItWorks.interface";
import { HowItWorksServices } from "./howItWorks.service";

const createHowItWorks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: IHowItWorks = {
      ...req.body,
      image: (req.file as Express.Multer.File).path,
    };
    const result = await HowItWorksServices.createHowItWorks(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "HowItWorks section created successfully",
      data: result,
    });
  },
);

const getAllHowItWorks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await HowItWorksServices.getAllHowItWorks();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "HowItWorks sections retrieved successfully",
      data: result,
    });
  },
);

const getHowItWorksById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await HowItWorksServices.getHowItWorksById(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "HowItWorks section retrieved successfully",
      data: result,
    });
  },
);

const updateHowItWorks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: Partial<IHowItWorks> = {
      ...req.body,
      ...(req.file && { image: (req.file as Express.Multer.File).path }),
    };
    const result = await HowItWorksServices.updateHowItWorks(
      req.params.id,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "HowItWorks section updated successfully",
      data: result,
    });
  },
);

const deleteHowItWorks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await HowItWorksServices.deleteHowItWorks(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "HowItWorks section deleted successfully",
      data: result,
    });
  },
);

export const HowItWorksController = {
  createHowItWorks,
  getAllHowItWorks,
  getHowItWorksById,
  updateHowItWorks,
  deleteHowItWorks,
};
