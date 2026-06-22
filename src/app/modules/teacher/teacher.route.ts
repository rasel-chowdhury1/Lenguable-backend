import { Router } from "express";
import { TeacherController } from "./teacher.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createTeacherZodSchema,
  updateTeacherZodSchema,
} from "./teacher.validation";
import { multerUpload } from "../../config/multer.config";
import { OAuth2Client } from "google-auth-library";
import { envVars } from "../../config";
import { UserModel } from "../user/user.model";
import { TeacherModel } from "./teacher.model";

const router = Router();

const getTeacherOAuthClient = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_TEACHER_URI,
  );

// Google OAuth (MUST be before /:id)

router.get("/google/connect", (req: any, res: any) => {
  const { userId } = req.query; // 👈 from query param, NOT req.user.id
  const client = getTeacherOAuthClient();

  console.log("CONNECT HIT — userId:", userId);
  console.log("REDIRECT URI:", process.env.GOOGLE_REDIRECT_TEACHER_URI);

  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
    state: userId as string, // 👈 pass userId as state
  });

  console.log("FULL URL:", url);
  res.redirect(url);
});

router.get("/google/callback", async (req: any, res: any) => {
  const { code, state: userId } = req.query;

  console.log("CALLBACK HIT");
  console.log("code:", code);
  console.log("userId:", userId);

  if (!code || !userId) {
    console.log("MISSING code or userId — redirecting to error");
    return res.redirect(
      `${envVars.FRONTEND_URL}/dashboard/teacher?google=error`,
    );
  }

  try {
    const client = getTeacherOAuthClient();
    const { tokens } = await client.getToken(code as string);
    console.log("tokens received:", !!tokens.refresh_token);

    const user = await UserModel.findById(userId);
    console.log("user found:", user?._id);

    if (!user?.teacher) {
      console.log("NO TEACHER on user — redirecting to error");
      return res.redirect(
        `${envVars.FRONTEND_URL}/dashboard/teacher?google=error`,
      );
    }

    await TeacherModel.findByIdAndUpdate(user.teacher, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
      googleTokenExpiry: tokens.expiry_date,
    });

    console.log("TOKENS SAVED ✅");

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

// Existing Routes

router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createTeacherZodSchema),
  TeacherController.createTeacher,
);

router.get("/", TeacherController.getAllTeachers);

router.get("/:id", checkAuth(Role.ADMIN), TeacherController.getSingleTeacher);

router.patch(
  "/:id",
  checkAuth(Role.TEACHER),
  multerUpload.single("file"),
  validateRequest(updateTeacherZodSchema),
  TeacherController.updateTeacher,
);

router.delete("/:id", checkAuth(Role.ADMIN), TeacherController.deleteTeacher);

export const TeacherRoutes = router;
