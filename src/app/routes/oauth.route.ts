import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { envVars } from "../config";
import { UserModel } from "../modules/user/user.model";
import { TeacherModel } from "../modules/teacher/teacher.model";

const router = Router();

const getTeacherOAuthClient = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_TEACHER_URI,
  );

// Google Connect — teacher clicks "Connect Google Account"
router.get("/google/connect", (req: any, res: any) => {
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
router.get("/google/callback", async (req: any, res: any) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.redirect(
      `${envVars.FRONTEND_URL}/dashboard/teacher?google=error`,
    );
  }

  try {
    const client = getTeacherOAuthClient();
    const { tokens } = await client.getToken(code as string);

    const user = await UserModel.findById(userId);
    if (!user?.teacher) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/dashboard/teacher?google=error`,
      );
    }

    await TeacherModel.findByIdAndUpdate(user.teacher, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
      googleTokenExpiry: tokens.expiry_date,
    });

    return res.redirect(
      `${envVars.FRONTEND_URL}/dashboard/teacher/my-account?google=connected`,
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(
      `${envVars.FRONTEND_URL}/dashboard/teacher?google=error`,
    );
  }
});

export default router;
