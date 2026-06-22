import { Router } from "express";
import { StatsController } from "./stats.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();
router.get("/", checkAuth(Role.ADMIN), StatsController.getDashboardStats);

export const StatsRoutes = router;
