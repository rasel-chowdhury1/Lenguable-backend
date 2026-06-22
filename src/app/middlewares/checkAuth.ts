import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../helpers/AppError";
import { UserModel } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.headers.authorization || req.cookies.accessToken;

        if (!accessToken) {
            throw new AppError(403, "You are not authorized")
        }


        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExist = await UserModel.findOne({ email: verifiedToken.email })

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not authorized")
        }
        req.user = verifiedToken
        next()

    } catch (error) {
        console.log("jwt error", error);
        next(error)
    }
}