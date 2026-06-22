"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteRoutes = void 0;
const express_1 = __importDefault(require("express"));
const note_controller_1 = require("./note.controller");
const note_validation_1 = require("./note.validation");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
// existing
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), (0, validateRequest_1.validateRequest)(note_validation_1.createNoteZodSchema), note_controller_1.NoteController.createNote);
router.get("/", note_controller_1.NoteController.getAllNotes);
router.get("/student/:studentId", note_controller_1.NoteController.getNotesByStudent);
// new
// Teacher: get all students
router.get("/my-students", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), note_controller_1.NoteController.getMyStudents);
// Admin: get all students
router.get("/all-students", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.TEACHER), note_controller_1.NoteController.getAllStudents);
// Teacher: get all lessons with unlock status for a student
router.get("/students/:studentId/lessons", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), note_controller_1.NoteController.getLessonsForStudent);
// Teacher: toggle unlock/lock a lesson for a student
router.patch("/students/:studentId/lessons/unlock", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), note_controller_1.NoteController.unlockLesson);
// Student: get own lessons (locked ones have content hidden)
router.get("/my-lessons", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), note_controller_1.NoteController.getMyLessons);
exports.NoteRoutes = router;
