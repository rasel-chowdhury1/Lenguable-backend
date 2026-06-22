import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TeacherServices } from "./teacher.service";
import httpStatus from "http-status-codes";
import { ITeacher } from "./teacher.interface";

const createTeacher = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacher = await TeacherServices.createTeacher(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Teacher created successfully !",
        data: teacher,
    });
});

const getAllTeachers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teachers = await TeacherServices.getAllTeachers();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Teachers retrieved successfully !",
        data: teachers,
    });
});

const getSingleTeacher = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = req.params.id;
    const teacher = await TeacherServices.getSingleTeacher(teacherId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Teacher retrieved successfully !",
        data: teacher,
    });
});

const updateTeacher = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = req.params.id;
    const payload: ITeacher = {
            ...req.body,
            profilePicture: req.file?.path
        }
    const result = await TeacherServices.updateTeacher(teacherId, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Teacher updated successfully !",
        data: result,
    });
});

const deleteTeacher = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = req.params.id;
    const result = await TeacherServices.deleteTeacher(teacherId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Teacher deleted successfully !",
        data: result,
    });
});

export const TeacherController = {
    createTeacher,
    getAllTeachers,
    getSingleTeacher,
    updateTeacher,
    deleteTeacher,
}