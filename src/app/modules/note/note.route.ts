import express from "express";
import { NoteController } from "./note.controller";
import { createNoteZodSchema } from "./note.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

// existing

router.post(
  "/",
  checkAuth(Role.TEACHER),
  validateRequest(createNoteZodSchema),
  NoteController.createNote,
);

router.get("/", NoteController.getAllNotes);

router.get("/student/:studentId", NoteController.getNotesByStudent);

// new

// Teacher: get all students
router.get(
  "/my-students",
  checkAuth(Role.TEACHER),
  NoteController.getMyStudents,
);

// Admin: get all students
router.get(
  "/all-students",
  checkAuth(Role.ADMIN, Role.TEACHER),
  NoteController.getAllStudents,
);

// Teacher: get all lessons with unlock status for a student
router.get(
  "/students/:studentId/lessons",
  checkAuth(Role.TEACHER),
  NoteController.getLessonsForStudent,
);

// Teacher: toggle unlock/lock a lesson for a student
router.patch(
  "/students/:studentId/lessons/unlock",
  checkAuth(Role.TEACHER),
  NoteController.unlockLesson,
);

// Student: get own lessons (locked ones have content hidden)
router.get("/my-lessons", checkAuth(Role.STUDENT), NoteController.getMyLessons);

export const NoteRoutes = router;
