import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CTAService } from "./cta.service";

const createCTA = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    image: (req.file as Express.Multer.File)?.path,
  };

  const result = await CTAService.createCTA(payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "CTA created successfully",
    data: result,
  });
});

const getCTA = catchAsync(async (req: Request, res: Response) => {
  const result = await CTAService.getCTA();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CTA fetched successfully",
    data: result,
  });
});

const updateCTA = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    ...(req.file && { image: (req.file as Express.Multer.File).path }),
  };

  const result = await CTAService.updateCTA(req.params.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CTA updated successfully",
    data: result,
  });
});

const deleteCTA = catchAsync(async (req: Request, res: Response) => {
  const result = await CTAService.deleteCTA(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CTA deleted successfully",
    data: result,
  });
});

export const CTAController = {
  createCTA,
  getCTA,
  updateCTA,
  deleteCTA,
};
