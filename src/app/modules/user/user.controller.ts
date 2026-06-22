import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const user = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User retrieved successfully !",
      data: user,
    });
  },
);

export const UserControllers = {
  getMe,
};
