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
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../config");
const user_model_1 = require("../modules/user/user.model");
const teacher_model_1 = require("../modules/teacher/teacher.model");
const router = (0, express_1.Router)();
const getTeacherOAuthClient = () => new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_TEACHER_URI);
// Google Connect — teacher clicks "Connect Google Account"
router.get("/google/connect", (req, res) => {
    const { userId } = req.query;
    const client = getTeacherOAuthClient();
    const url = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/calendar"],
        state: userId,
    });
    res.redirect(url);
});
// Google Callback — Google redirects here after teacher approves
router.get("/google/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, state: userId } = req.query;
    if (!code || !userId) {
        return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher?google=error`);
    }
    try {
        const client = getTeacherOAuthClient();
        const { tokens } = yield client.getToken(code);
        const user = yield user_model_1.UserModel.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.teacher)) {
            return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher?google=error`);
        }
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(user.teacher, {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiry: tokens.expiry_date,
        });
        return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher/my-account?google=connected`);
    }
    catch (error) {
        console.error("Google OAuth callback error:", error);
        return res.redirect(`${config_1.envVars.FRONTEND_URL}/dashboard/teacher?google=error`);
    }
}));
exports.default = router;
