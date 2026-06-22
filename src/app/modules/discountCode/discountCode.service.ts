import crypto from "crypto";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../helpers/AppError";
import { DiscountCodeModel } from "./discountCode.model";
import { PackageModel } from "../package/package.model";

const generateCode = async (packageId: string, discountPercent: number) => {
  const packageData = await PackageModel.findById(packageId);
  if (!packageData) {
    throw new AppError(httpStatus.NOT_FOUND, "Package not found");
  }

  const code = "DISC-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const discountCode = await DiscountCodeModel.create({
    code,
    discountPercent,
    packageId,
    usedBy: [],
  });

  return discountCode;
};

// Read-only check — called from /validate endpoint (Apply button)
const validateCode = async (
  code: string,
  packageId: string,
  studentId: string,
) => {
  const discountCode = await DiscountCodeModel.findOne({
    code: code.toUpperCase().trim(),
  }).populate("packageId", "name");

  if (!discountCode)
    throw new AppError(httpStatus.NOT_FOUND, "Invalid discount code");

  if (discountCode.packageId._id.toString() !== packageId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This code can only be used for the ${(discountCode.packageId as any).name} package`,
    );
  }

  // Check if THIS student already used a coupon on THIS package
  const alreadyUsed = await DiscountCodeModel.findOne({
    packageId: new Types.ObjectId(packageId),
    usedBy: new Types.ObjectId(studentId),
  });

  if (alreadyUsed) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already used a discount code for this package",
    );
  }

  return {
    valid: true,
    discountPercent: discountCode.discountPercent,
    codeId: discountCode._id.toString(),
  };
};

// Called at checkout session creation — immediately locks the code for this student
const claimCode = async (
  code: string,
  packageId: string,
  studentId: string,
) => {
  const discountCode = await DiscountCodeModel.findOne({
    code: code.toUpperCase().trim(),
  }).populate("packageId", "name");

  if (!discountCode)
    throw new AppError(httpStatus.NOT_FOUND, "Invalid discount code");

  if (discountCode.packageId._id.toString() !== packageId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This code can only be used for the ${(discountCode.packageId as any).name} package`,
    );
  }

  // Check if THIS student already used a coupon on THIS package
  const alreadyUsed = await DiscountCodeModel.findOne({
    packageId: new Types.ObjectId(packageId),
    usedBy: new Types.ObjectId(studentId),
  });

  if (alreadyUsed) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already used a discount code for this package",
    );
  }

  // Immediately push studentId so they can't use another code on this package
  await DiscountCodeModel.findByIdAndUpdate(discountCode._id, {
    $push: { usedBy: new Types.ObjectId(studentId) },
    $set: { usedAt: new Date() },
  });

  return {
    valid: true,
    discountPercent: discountCode.discountPercent,
    codeId: discountCode._id.toString(),
  };
};

// No-op — already recorded in claimCode
const markCodeAsUsed = async (codeId: string, studentId: string) => {};

const getAllCodes = async () => {
  return await DiscountCodeModel.find()
    .populate("packageId", "name price")
    .populate("usedBy", "name email")
    .sort({ createdAt: -1 });
};

const deleteCode = async (id: string) => {
  return await DiscountCodeModel.findByIdAndDelete(id);
};

export const DiscountCodeService = {
  generateCode,
  validateCode,
  claimCode,
  markCodeAsUsed,
  getAllCodes,
  deleteCode,
};