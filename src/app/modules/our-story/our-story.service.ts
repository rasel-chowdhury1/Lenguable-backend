import { IOurStory } from "./our-story.interface";
import OurStory from "./our-story.model";

const createOurStory = async (payload: IOurStory) => {
  const result = await OurStory.create(payload);
  return result;
};

const getAllOurStory = async () => {
  const result = await OurStory.find();
  return result;
};

const getOurStoryById = async (id: string) => {
  const result = await OurStory.findById(id);
  return result;
};

const updateOurStory = async (id: string, payload: Partial<IOurStory>) => {
  const result = await OurStory.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteOurStory = async (id: string) => {
  const result = await OurStory.findByIdAndDelete(id);
  return result;
};

export const OurStoryServices = {
  createOurStory,
  getAllOurStory,
  getOurStoryById,
  updateOurStory,
  deleteOurStory,
};
