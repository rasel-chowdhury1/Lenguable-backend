import { IWhatYouGet } from "./whatYouGet.interface";
import WhatYouGet from "./whatYouGet.model";

const createWhatYouGet = async (payload: IWhatYouGet) => {
  const result = await WhatYouGet.create(payload);
  return result;
};

const getAllWhatYouGet = async () => {
  const result = await WhatYouGet.find();
  return result;
};

const getWhatYouGetById = async (id: string) => {
  const result = await WhatYouGet.findById(id);
  return result;
};

const updateWhatYouGet = async (id: string, payload: Partial<IWhatYouGet>) => {
  const result = await WhatYouGet.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteWhatYouGet = async (id: string) => {
  const result = await WhatYouGet.findByIdAndDelete(id);
  return result;
};

export const WhatYouGetServices = {
  createWhatYouGet,
  getAllWhatYouGet,
  getWhatYouGetById,
  updateWhatYouGet,
  deleteWhatYouGet,
};
