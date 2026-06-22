import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ResourceService } from "./resource.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";

const createResource = catchAsync(async (req: Request, res: Response) => {
  const result = await ResourceService.createResource(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Resource created successfully!",
    data: result,
  });
});

const getAllResources = catchAsync(async (req: Request, res: Response) => {
  const result = await ResourceService.getAllResources();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Resources retrieved successfully!",
    data: result,
  });
});

const getSingleResource = catchAsync(async (req: Request, res: Response) => {
  const result = await ResourceService.getSingleResource(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Resource retrieved successfully!",
    data: result,
  });
});

const updateResource = catchAsync(async (req: Request, res: Response) => {
  const result = await ResourceService.updateResource(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Resource updated successfully!",
    data: result,
  });
});

const deleteResource = catchAsync(async (req: Request, res: Response) => {
  const result = await ResourceService.deleteResource(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Resource deleted successfully!",
    data: result,
  });
});

export const ResourceController = {
  createResource,
  getAllResources,
  getSingleResource,
  updateResource,
  deleteResource,
};
