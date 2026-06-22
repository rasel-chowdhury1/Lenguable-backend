import crypto from "crypto";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";
import { UserModel } from "../user/user.model";
import AppError from "../../helpers/AppError";
const OTP_EXPIRATION = 2 * 60;

const generateOtp = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();

  return otp;
};

const sendOTP = async (email: string, name: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const otp = generateOtp();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: name,
      otp: otp,
    },
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp) {
    throw new AppError(401, "Invalid OTP");
  }

  if (savedOtp !== otp) {
    throw new AppError(401, "Invalid OTP");
  }

  await Promise.all([
    UserModel.updateOne(
      { email },
      { isVerified: true },
      { runValidators: true },
    ),
    redisClient.del([redisKey]),
  ]);
};

export const OTPService = {
  sendOTP,
  verifyOTP,
};
