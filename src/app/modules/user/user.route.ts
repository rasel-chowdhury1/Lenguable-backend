import { Router } from "express";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/getMe", checkAuth(...Object.values(Role)), UserControllers.getMe);

export const UserRoutes = router;