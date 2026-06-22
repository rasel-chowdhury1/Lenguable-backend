import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { generateToken, verifyToken } from "./jwt";
import { IUser } from "../modules/user/user.interface";
import { envVars } from "../config";
import { UserModel } from "../modules/user/user.model";
import AppError from "../helpers/AppError";

export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    }
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRE)

    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRE)


    return {
        accessToken,
        refreshToken
    }
}

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {

    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload


    const isUserExist = await UserModel.findOne({ email: verifiedRefreshToken.email })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRE)

    return accessToken
}