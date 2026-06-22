import { IAbout } from "./about.interface";
import { About } from "./about.model";

const createAbout = async (payload: IAbout) => {
  const result = await About.create(payload);
  return result;
};

const getAllAbout = async () => {
  const result = await About.find();
  return result;
};

const getAboutById = async (id: string) => {
  const result = await About.findById(id);
  return result;
};

const updateAbout = async (id: string, payload: Partial<IAbout>) => {
  const result = await About.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteAbout = async (id: string) => {
  const result = await About.findByIdAndDelete(id);
  return result;
};

export const AboutServices = {
  createAbout,
  getAllAbout,
  getAboutById,
  updateAbout,
  deleteAbout,
};
