/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../../helpers/AppError";
import { IUser } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userToken";
import { envVars } from "../../config";
import { sendEmail } from "../../utils/sendEmail";


const credentialsLogin = async (payload: Partial<IUser> & { timezone?: string }) => {

  const { email, password, timezone } = payload;

  const isUserExist = await UserModel.findOne({ email: email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  // Save timezone on every login for existing users
  if (timezone) {
    await UserModel.findByIdAndUpdate(isUserExist._id, { timezone });
  }

  const userTokens = createUserTokens(isUserExist);
  const { password: pass, ...rest } = isUserExist.toObject();

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};


const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};
const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await UserModel.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string,
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  user!.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await UserModel.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgotPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });
};

const resetPassword = async (
  payload: Record<string, any>,
  decodedToken: JwtPayload,
) => {
  if (payload.id != decodedToken.userId) {
    throw new AppError(401, "You can not reset your password");
  }

  const isUserExist = await UserModel.findById(decodedToken.userId);
  if (!isUserExist) {
    throw new AppError(401, "User does not exist");
  }

  const hashedPassword = await bcryptjs.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  isUserExist.password = hashedPassword;

  await isUserExist.save();
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
