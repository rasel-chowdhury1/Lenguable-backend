import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { IWhatYouGet } from "./whatYouGet.interface";
import { WhatYouGetServices } from "./whatYouGet.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createWhatYouGet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: IWhatYouGet = req.body;
    const result = await WhatYouGetServices.createWhatYouGet(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "WhatYouGet section created successfully",
      data: result,
    });
  },
);

const getAllWhatYouGet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WhatYouGetServices.getAllWhatYouGet();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "WhatYouGet sections retrieved successfully",
      data: result,
    });
  },
);

const getWhatYouGetById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WhatYouGetServices.getWhatYouGetById(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "WhatYouGet section retrieved successfully",
      data: result,
    });
  },
);

const updateWhatYouGet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WhatYouGetServices.updateWhatYouGet(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "WhatYouGet section updated successfully",
      data: result,
    });
  },
);

const deleteWhatYouGet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WhatYouGetServices.deleteWhatYouGet(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "WhatYouGet section deleted successfully",
      data: result,
    });
  },
);

export const WhatYouGetController = {
  createWhatYouGet,
  getAllWhatYouGet,
  getWhatYouGetById,
  updateWhatYouGet,
  deleteWhatYouGet,
};
