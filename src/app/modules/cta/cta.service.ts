import { CTA } from "./cta.model";
import { ICTA } from "./cta.interface";

const createCTA = async (payload: ICTA) => {
  return await CTA.create(payload);
};

const getCTA = async () => {
  return await CTA.findOne();
};

const updateCTA = async (id: string, payload: Partial<ICTA>) => {
  return await CTA.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCTA = async (id: string) => {
  return await CTA.findByIdAndDelete(id);
};

export const CTAService = {
  createCTA,
  getCTA,
  updateCTA,
  deleteCTA,
};