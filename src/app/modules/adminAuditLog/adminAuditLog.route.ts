import { Router } from "express";
import { AdminAuditLogController } from "./adminAuditLog.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { createAuditLogZodSchema } from "./adminAuditLog.validation";

const router = Router();

// All routes are admin-only

// Get all audit logs
router.get("/", checkAuth(Role.ADMIN), AdminAuditLogController.getAllLogs);

// Get logs filtered by action type
router.get(
  "/action/:action",
  checkAuth(Role.ADMIN),
  AdminAuditLogController.getLogsByAction,
);

// Get logs performed by a specific admin
router.get(
  "/admin/:adminId",
  checkAuth(Role.ADMIN),
  AdminAuditLogController.getLogsByAdmin,
);

// Get logs targeting a specific user
router.get(
  "/target/:targetId",
  checkAuth(Role.ADMIN),
  AdminAuditLogController.getLogsByTarget,
);

// Manually create an audit log entry
router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createAuditLogZodSchema),
  AdminAuditLogController.createAuditLog,
);

export const AdminAuditLogRoutes = router;
