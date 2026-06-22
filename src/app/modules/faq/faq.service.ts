import { FAQ } from "./faq.model";

const createFAQ = async (payload: any) => {
  const result = await FAQ.create(payload);
  return result;
};

const getAllFAQ = async () => {
  const result = await FAQ.find();
  return result;
};

const getFAQById = async (id: string) => {
  const result = await FAQ.findById(id);
  return result;
};

const updateFAQ = async (id: string, payload: any) => {
  const result = await FAQ.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteFAQ = async (id: string) => {
  const result = await FAQ.findByIdAndDelete(id);
  return result;
};

export const FAQService = {
  createFAQ,
  getAllFAQ,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};