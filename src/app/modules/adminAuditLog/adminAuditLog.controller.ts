import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { AdminAuditLogService } from "./adminAuditLog.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuditAction } from "./adminAuditLog.interface";

const createAuditLog = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user.userId;
  const { targetId, action, details } = req.body;

  const result = await AdminAuditLogService.createAuditLog({
    adminId,
    targetId,
    action,
    details,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Audit log created successfully",
    data: result,
  });
});

const getAllLogs = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminAuditLogService.getAllLogs();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audit logs retrieved successfully",
    data: result,
  });
});

const getLogsByAction = catchAsync(async (req: Request, res: Response) => {
  const { action } = req.params;
  const result = await AdminAuditLogService.getLogsByAction(action as AuditAction);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audit logs retrieved successfully",
    data: result,
  });
});

const getLogsByAdmin = catchAsync(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const result = await AdminAuditLogService.getLogsByAdmin(adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin audit logs retrieved successfully",
    data: result,
  });
});

const getLogsByTarget = catchAsync(async (req: Request, res: Response) => {
  const { targetId } = req.params;
  const result = await AdminAuditLogService.getLogsByTarget(targetId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Target audit logs retrieved successfully",
    data: result,
  });
});

export const AdminAuditLogController = {
  createAuditLog,
  getAllLogs,
  getLogsByAction,
  getLogsByAdmin,
  getLogsByTarget,
};
