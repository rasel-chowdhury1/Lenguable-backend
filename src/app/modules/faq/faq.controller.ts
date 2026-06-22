import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { FAQService } from "./faq.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";

const createFAQ = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.createFAQ(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "FAQ created successfully",
    data: result,
  });
});

const getAllFAQ = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.getAllFAQ();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "FAQ fetched successfully",
    data: result,
  });
});

const getFAQById = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.getFAQById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "FAQ fetched successfully",
    data: result,
  });
});

const updateFAQ = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.updateFAQ(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "FAQ updated successfully",
    data: result,
  });
});

const deleteFAQ = catchAsync(async (req: Request, res: Response) => {
  const result = await FAQService.deleteFAQ(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "FAQ deleted successfully",
    data: result,
  });
});

export const FAQController = {
  createFAQ,
  getAllFAQ,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};