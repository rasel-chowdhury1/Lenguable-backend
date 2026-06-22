import { IHowItWorks } from "./howItWorks.interface";
import { HowItWorks } from "./howItWorks.model";

const createHowItWorks = async (payload: IHowItWorks) => {
  const result = await HowItWorks.create(payload);
  return result;
};

const getAllHowItWorks = async () => {
  const result = await HowItWorks.find();
  return result;
};

const getHowItWorksById = async (id: string) => {
  const result = await HowItWorks.findById(id);
  return result;
};

const updateHowItWorks = async (id: string, payload: Partial<IHowItWorks>) => {
  const result = await HowItWorks.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteHowItWorks = async (id: string) => {
  const result = await HowItWorks.findByIdAndDelete(id);
  return result;
};

export const HowItWorksServices = {
  createHowItWorks,
  getAllHowItWorks,
  getHowItWorksById,
  updateHowItWorks,
  deleteHowItWorks,
};
