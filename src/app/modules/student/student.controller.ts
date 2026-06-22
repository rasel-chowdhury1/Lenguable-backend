import { Request, Response } from "express";
import { StudentServices } from "./student.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { IStudent } from "./student.interface";

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentServices.createStudent(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Student created successfully",
    data: result,
  });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentServices.getAllStudents();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Students retrieved successfully",
    data: result,
  });
});

const getSingleStudent = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.id;
  const result = await StudentServices.getSingleStudent(studentId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Student retrieved successfully",
    data: result,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.id;

  const payload: IStudent = {
    ...req.body,
    profilePicture: req.file?.path,
  };

  const result = await StudentServices.updateStudent(studentId, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Student updated successfully",
    data: result,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.id;
  const result = await StudentServices.deleteStudent(studentId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Student deleted successfully",
    data: result,
  });
});

const addCredits = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.id;
  const { credits } = req.body;

  const result = await StudentServices.addCredits(studentId, Number(credits));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `${credits} credits added successfully`,
    data: result,
  });
});

const removeCredits = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.id;
  const { credits } = req.body;

  const result = await StudentServices.removeCredits(studentId, Number(credits));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `${credits} credits removed successfully`,
    data: result,
  });
});

export const StudentControllers = {
  createStudent,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
  addCredits,
  removeCredits,
};
