import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { HeroServices } from "./hero.service";
import { IHero } from "./hero.interface";

const createHero = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: IHero = {
      ...req.body,
      images: (req.files as Express.Multer.File[]).map((file) => file.path),
    };
    const result = await HeroServices.createHero(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Hero created successfully",
      data: result,
    });
  },
);

const getHero = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await HeroServices.getHero();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Hero fetched successfully",
      data: result,
    });
  },
);

const updateHero = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const images = files?.map((file) => file.path) || [];

    const payload = {
      ...req.body,
    };

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      payload.images = (req.files as Express.Multer.File[]).map(
        (file) => file.path,
      );
    }
    const result = await HeroServices.updateHero(id, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Hero updated successfully",
      data: result,
    });
  },
);

const deleteHero = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await HeroServices.deleteHero(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Hero deleted successfully",
      data: result,
    });
  },
);

export const HeroController = {
  createHero,
  getHero,
  updateHero,
  deleteHero,
};
