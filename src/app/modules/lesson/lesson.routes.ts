import { Router } from "express";
import { LessonController } from "./lesson.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createLessonZodSchema } from "./lesson.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { pdfUpload } from "../../config/multer.pdf.config";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN),
  pdfUpload.single("file"),
  validateRequest(createLessonZodSchema),
  LessonController.createLesson,
);

router.get("/", LessonController.getAllLessons);

router.get("/:id", LessonController.getSingleLesson);

router.patch(
  "/reorder", 
  checkAuth(Role.ADMIN),
  LessonController.reorderLessons,
)

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  pdfUpload.single("file"),
  LessonController.updateLesson,
);

router.delete("/:id", checkAuth(Role.ADMIN), LessonController.deleteLesson);

export const LessonRoutes = router;
