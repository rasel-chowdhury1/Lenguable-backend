import { Router } from "express";
import { TeacherEarningController } from "./teacherEarning.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { adminAdjustEarningsZodSchema } from "./teacherEarning.validation";

const router = Router();

// Teacher: own earning history
router.get("/my", checkAuth(Role.TEACHER), TeacherEarningController.getMyEarnings);

// Admin: all earning records
router.get("/", checkAuth(Role.ADMIN), TeacherEarningController.getAllEarnings);

// Admin: earning records for a specific teacher
router.get(
  "/teacher/:teacherId",
  checkAuth(Role.ADMIN),
  TeacherEarningController.getTeacherEarnings,
);

// Admin: manually adjust a teacher's earnings
router.post(
  "/adjust",
  checkAuth(Role.ADMIN),
  validateRequest(adminAdjustEarningsZodSchema),
  TeacherEarningController.adminAdjustEarnings,
);

export const TeacherEarningRoutes = router;
