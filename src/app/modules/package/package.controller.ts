import { Request, Response } from "express";
import { PackageService } from "./package.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.createPackage(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Package created successfully",
    data: result,
  });
});

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.getAllPackages();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages retrieved successfully",
    data: result,
  });
});

const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PackageService.getSinglePackage(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package retrieved successfully",
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PackageService.updatePackage(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package updated successfully",
    data: result,
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PackageService.deletePackage(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package deleted successfully",
    data: result,
  });
});

export const PackageController = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
};
