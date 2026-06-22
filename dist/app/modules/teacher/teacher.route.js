"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherRoutes = void 0;
const express_1 = require("express");
const teacher_controller_1 = require("./teacher.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const validateRequest_1 = require("../../middlewares/validateRequest");
const teacher_validation_1 = require("./teacher.validation");
const multer_config_1 = require("../../config/multer.config");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../../config");
const user_model_1 = require("../user/user.model");
const teacher_model_1 = require("./teacher.model");
const router = (0, express_1.Router)();
const getTeacherOAuthClient = () => new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_TEACHER_URI);
// Google OAuth (MUST be before /:id)
router.get("/google/connect", (req, res) => {
    const { userId } = req.query; // 👈 from query param, NOT req.user.id
    const client = getTeacherOAuthClient();
    console.log("CONNECT HIT — userId:", userId);
    console.log("REDIRECT URI:", process.env.GOOGLE_REDIRECT_TEACHER_URI);
    const url = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/calendar"],
        state: userId, // 👈 pass userId as state
    });
    console.log("FULL URL:", url);
    res.redirect(url);
});
router.get("/google/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, state: userId } = req.query;
    console.log("CALLBACK HIT");
    console.log("code:", code);
    console.log("userId:", userId);
    if (!code || !userId) {
        console.log("MISSING code or userId — redirecting to error");
        return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher?google=error`);
    }
    try {
        const client = getTeacherOAuthClient();
        const { tokens } = yield client.getToken(code);
        console.log("tokens received:", !!tokens.refresh_token);
        const user = yield user_model_1.UserModel.findById(userId);
        console.log("user found:", user === null || user === void 0 ? void 0 : user._id);
        if (!(user === null || user === void 0 ? void 0 : user.teacher)) {
            console.log("NO TEACHER on user — redirecting to error");
            return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher?google=error`);
        }
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(user.teacher, {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiry: tokens.expiry_date,
        });
        console.log("TOKENS SAVED ✅");
        return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher/my-account?google=connected`);
    }
    catch (error) {
        console.error("Google OAuth callback error:", error);
        return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher?google=error`);
    }
}));
// Existing Routes
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(teacher_validation_1.createTeacherZodSchema), teacher_controller_1.TeacherController.createTeacher);
router.get("/", teacher_controller_1.TeacherController.getAllTeachers);
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), teacher_controller_1.TeacherController.getSingleTeacher);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), multer_config_1.multerUpload.single("file"), (0, validateRequest_1.validateRequest)(teacher_validation_1.updateTeacherZodSchema), teacher_controller_1.TeacherController.updateTeacher);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), teacher_controller_1.TeacherController.deleteTeacher);
exports.TeacherRoutes = router;
