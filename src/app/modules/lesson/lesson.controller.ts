import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { LessonService } from "./lesson.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ILesson } from "./lesson.interface";
import { envVars } from "../../config";

const createLesson = catchAsync(async (req: Request, res: Response) => {
  const payload: ILesson = {
    ...req.body,
    file: `${envVars.UPLOAD_URL}/${req.file?.filename}`,
  };

  const result = await LessonService.createLesson(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Lesson created successfully!",
    data: result,
  });
});

const getAllLessons = catchAsync(async (req: Request, res: Response) => {
  const result = await LessonService.getAllLessons();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Lessons retrieved successfully!",
    data: result,
  });
});

const getSingleLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await LessonService.getSingleLesson(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Lesson retrieved successfully!",
    data: result,
  });
});

const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Parse JSON string from FormData "data" field
  const parsedData = req.body.data ? JSON.parse(req.body.data) : req.body;

  // Only update file if a new one was uploaded
  const payload: Partial<ILesson> = {
    ...parsedData,
    ...(req.file && { file: `${envVars.UPLOAD_URL}/${req.file.filename}` }),
  };

  const result = await LessonService.updateLesson(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Lesson updated successfully!",
    data: result,
  });
});

const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await LessonService.deleteLesson(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Lesson deleted successfully!",
    data: result,
  });
});

const reorderLessons = catchAsync(async (req: Request, res: Response) => {
  const { orderedIds } = req.body;

  await LessonService.reorderLessons(orderedIds);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Lessons reordered successfully!",
    data: null,
  });
});

export const LessonController = {
  createLesson,
  getAllLessons,
  getSingleLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};