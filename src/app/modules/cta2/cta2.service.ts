import { CTA2 } from "./cta2.model";
import { ICTA2 } from "./cta2.interface";

const createCTA2 = async (payload: ICTA2) => {
  return await CTA2.create(payload);
};

const getCTA2 = async () => {
  return await CTA2.find();
};

const updateCTA2 = async (id: string, payload: Partial<ICTA2>) => {
  return await CTA2.findByIdAndUpdate(id, payload, {
    new: true,
  });
};

const deleteCTA2 = async (id: string) => {
  return await CTA2.findByIdAndDelete(id);
};

export const CTA2Service = {
  createCTA2,
  getCTA2,
  updateCTA2,
  deleteCTA2,
};