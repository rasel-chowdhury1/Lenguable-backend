import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { AuthServices } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: loginInfo,
    });
  },
);

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not found");
    }
    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string,
    );

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "New access token generated successfully",
      data: tokenInfo,
    });
  },
);


const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isProduction = envVars.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
      domain: isProduction ? ".lenguable.com" : undefined,
      expires: new Date(0),
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged out successfully",
      data: null,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    await AuthServices.changePassword(oldPassword, newPassword, decodedToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password reset successfully",
      data: null,
    });
  },
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await AuthServices.forgotPassword(email);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Email Sent Successfully",
      data: null,
    });
  },
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  },
);

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
