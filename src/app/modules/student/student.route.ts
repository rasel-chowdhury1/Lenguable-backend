import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { StudentControllers } from "./student.controller";
import { createStudentSchema, updateStudentSchema } from "./student.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
  "/",
  validateRequest(createStudentSchema),
  StudentControllers.createStudent,
);

router.get("/", StudentControllers.getAllStudents);

router.get("/:id", StudentControllers.getSingleStudent);

router.patch(
  "/:id",
  checkAuth(Role.STUDENT),
  multerUpload.single("file"),
  validateRequest(updateStudentSchema),
  StudentControllers.updateStudent,
);

router.delete("/:id", checkAuth(Role.ADMIN), StudentControllers.deleteStudent);

// Add credits — admin only
router.patch(
  "/:id/credits",
  checkAuth(Role.ADMIN),
  StudentControllers.addCredits,
);

// Remove credits — admin only
router.patch(
  "/:id/credits/remove",
  checkAuth(Role.ADMIN),
  StudentControllers.removeCredits,
);

export const StudentRoutes = router;
