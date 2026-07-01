import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { AdminAuditLogModel } from "./adminAuditLog.model";
import { AuditAction, IAdminAuditLog } from "./adminAuditLog.interface";

// Internal helper — call this from any service when an admin performs an action
const createAuditLog = async (
  payload: Omit<IAdminAuditLog, "createdAt" | "updatedAt">,
) => {
  return AdminAuditLogModel.create(payload);
};

// Admin: get all audit logs
const getAllLogs = async () => {
  return AdminAuditLogModel.find()
    .populate("adminId", "name email")
    .populate("targetId", "name email role")
    .sort({ createdAt: -1 });
};

// Admin: get logs by action type
const getLogsByAction = async (action: AuditAction) => {
  return AdminAuditLogModel.find({ action })
    .populate("adminId", "name email")
    .populate("targetId", "name email role")
    .sort({ createdAt: -1 });
};

// Admin: get all logs performed by a specific admin
const getLogsByAdmin = async (adminId: string) => {
  return AdminAuditLogModel.find({ adminId })
    .populate("targetId", "name email role")
    .sort({ createdAt: -1 });
};

// Admin: get all logs targeting a specific user
const getLogsByTarget = async (targetId: string) => {
  return AdminAuditLogModel.find({ targetId })
    .populate("adminId", "name email")
    .sort({ createdAt: -1 });
};

export const AdminAuditLogService = {
  createAuditLog,
  getAllLogs,
  getLogsByAction,
  getLogsByAdmin,
  getLogsByTarget,
};
