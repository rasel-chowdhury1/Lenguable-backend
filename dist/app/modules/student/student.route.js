"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = require("../../middlewares/validateRequest");
const student_controller_1 = require("./student.controller");
const student_validation_1 = require("./student.validation");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
router.post("/", (0, validateRequest_1.validateRequest)(student_validation_1.createStudentSchema), student_controller_1.StudentControllers.createStudent);
router.get("/", student_controller_1.StudentControllers.getAllStudents);
router.get("/:id", student_controller_1.StudentControllers.getSingleStudent);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), multer_config_1.multerUpload.single("file"), (0, validateRequest_1.validateRequest)(student_validation_1.updateStudentSchema), student_controller_1.StudentControllers.updateStudent);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), student_controller_1.StudentControllers.deleteStudent);
// Add credits — admin only
router.patch("/:id/credits", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), student_controller_1.StudentControllers.addCredits);
// Remove credits — admin only
router.patch("/:id/credits/remove", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), student_controller_1.StudentControllers.removeCredits);
exports.StudentRoutes = router;
