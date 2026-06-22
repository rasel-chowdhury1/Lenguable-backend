import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.use("/login", AuthControllers.credentialsLogin);
router.use("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post("/change-password", checkAuth(...Object.values(Role)), AuthControllers.changePassword);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post("/reset-password", checkAuth(...Object.values(Role)), AuthControllers.resetPassword)

export const AuthRoutes = router;