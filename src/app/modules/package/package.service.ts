import AppError from "../../helpers/AppError";
import { IPackage } from "./package.interface";
import { PackageModel } from "./package.model";
import httpStatus from "http-status-codes";

const createPackage = async (payload: IPackage) => {
  const isExistingPackage = await PackageModel.findOne({
    name: payload.name,
  });

  if (isExistingPackage) {
    throw new AppError(httpStatus.CONFLICT, "Package already exist !");
  }

  const result = await PackageModel.create(payload);
  return result;
};

const getAllPackages = async () => {
  const result = await PackageModel.find();
  return result;
};

const getSinglePackage = async (id: string) => {
  const result = await PackageModel.findById(id);
  return result;
};

const updatePackage = async (id: string, payload: Partial<IPackage>) => {
  const packageData = await PackageModel.findById(id);

  if (!packageData) {
    throw new AppError(httpStatus.NOT_FOUND, "Package not found");
  }

  const result = await PackageModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deletePackage = async (id: string) => {
  const result = await PackageModel.findByIdAndDelete(id);
  return result;
};

export const PackageService = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
};
