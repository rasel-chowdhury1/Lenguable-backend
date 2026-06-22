import { Types } from "mongoose";
import AppError from "../../helpers/AppError";
import { ILesson } from "./lesson.interface";
import { LessonModel } from "./lesson.model";
import httpStatus from "http-status-codes";

const createLesson = async (payload: ILesson) => {
  const isExistingLesson = await LessonModel.findOne({
    title: payload.title,
  });

  if (isExistingLesson) {
    throw new AppError(httpStatus.CONFLICT, "Lesson already exist!");
  }

  // Auto-assign the next order value
  const lastLesson = await LessonModel.findOne().sort({ order: -1 });
  const nextOrder = lastLesson ? lastLesson.order + 1 : 0;

  const result = await LessonModel.create({ ...payload, order: nextOrder });
  return result;
};

const getAllLessons = async () => {
  // Sort by order ascending so the admin-defined order is respected
  const result = await LessonModel.find().sort({ order: 1 });
  return result;
};

const getSingleLesson = async (id: string) => {
  const result = await LessonModel.findById(id);
  return result;
};

const updateLesson = async (id: string, payload: Partial<ILesson>) => {
  const isExistLesson = await LessonModel.findById(id);
  if (!isExistLesson) {
    throw new AppError(httpStatus.NOT_FOUND, "Lesson not found!");
  }

  const result = await LessonModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteLesson = async (id: string) => {
  const result = await LessonModel.findByIdAndDelete(id);
  return result;
};

const reorderLessons = async (orderedIds: string[]) => {
  if (!orderedIds || orderedIds.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "orderedIds must be a non-empty array",
    );
  }

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new Types.ObjectId(id) },
      update: { $set: { order: index } },
    },
  }));

  await LessonModel.bulkWrite(bulkOps);
};

export const LessonService = {
  createLesson,
  getAllLessons,
  getSingleLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
