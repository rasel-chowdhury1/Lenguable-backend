import AppError from "../../helpers/AppError";
import { IAnnouncement } from "./announcement.interface";
import { AnnouncementModel } from "./announcement.model";
import httpStatus from "http-status-codes";

const createAnnouncement = async (payload: IAnnouncement) => {
  const result = await AnnouncementModel.create(payload);
  return result;
};

const getAnnouncement = async () => {
  const result = await AnnouncementModel.findOne().sort({ createdAt: -1 });
  return result;
};

const updateAnnouncement = async (
  id: string,
  payload: Partial<IAnnouncement>,
) => {
  const announcement = await AnnouncementModel.findById(id);

  if (!announcement) {
    throw new AppError(httpStatus.NOT_FOUND, "Announcement not found");
  }

  const result = await AnnouncementModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteAnnouncement = async (id: string) => {
  const result = await AnnouncementModel.findByIdAndDelete(id);
  return result;
};

export const AnnouncementService = {
  createAnnouncement,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
