import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { NoteService } from "./note.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// existing

const createNote = async (req: Request, res: Response) => {
  const result = await NoteService.createNote(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Note created successfully",
    data: result,
  });
};

const getAllNotes = async (req: Request, res: Response) => {
  const result = await NoteService.getAllNotes();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Notes retrieved successfully",
    data: result,
  });
};

const getNotesByStudent = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const result = await NoteService.getNotesByStudent(studentId);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Student notes retrieved successfully",
    data: result,
  });
};

// new

const getMyStudents = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await NoteService.getMyStudents(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Students retrieved successfully",
    data: result,
  });
});

const unlockLesson = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { studentId } = req.params;
  const { lessonId } = req.body;

  if (!lessonId) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "lessonId is required",
      data: null,
    });
  }

  const result = await NoteService.unlockLesson(userId, studentId, lessonId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Lesson ${result.action} successfully`,
    data: result,
  });
});

const getLessonsForStudent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { studentId } = req.params;
  const result = await NoteService.getLessonsForStudent(userId, studentId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Lessons retrieved successfully",
    data: result,
  });
});

const getMyLessons = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await NoteService.getMyLessons(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Lessons retrieved successfully",
    data: result,
  });
});

const getAllStudents = catchAsync(async (_req: Request, res: Response) => {
  const result = await NoteService.getAllStudents();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All students retrieved successfully",
    data: result,
  });
});

export const NoteController = {
  createNote,
  getAllNotes,
  getNotesByStudent,
  getMyStudents,
  getAllStudents,
  unlockLesson,
  getLessonsForStudent,
  getMyLessons,
};
