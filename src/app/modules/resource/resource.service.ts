import AppError from "../../helpers/AppError";
import { IResource } from "./resource.interface";
import { ResourceModel } from "./resource.model";
import httpStatus from "http-status-codes";

const createResource = async (payload: IResource) => {
  const isExistResource = await ResourceModel.findOne({
    title: payload.title,
  });

  if (isExistResource) {
    throw new AppError(httpStatus.CONFLICT, "Resource already exist !");
  }
  const result = await ResourceModel.create(payload);
  return result;
};

const getAllResources = async () => {
  const result = await ResourceModel.find().sort({ createdAt: -1 });
  return result;
};

const getSingleResource = async (id: string) => {
  const result = await ResourceModel.findById(id);
  return result;
};

const updateResource = async (id: string, payload: Partial<IResource>) => {
  const isExistResource = await ResourceModel.findById(id);

  if (!isExistResource) {
    throw new AppError(httpStatus.NOT_FOUND, "Resource not found !");
  }
  const result = await ResourceModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteResource = async (id: string) => {
  const result = await ResourceModel.findByIdAndDelete(id);
  return result;
};

export const ResourceService = {
  createResource,
  getAllResources,
  getSingleResource,
  updateResource,
  deleteResource,
};
