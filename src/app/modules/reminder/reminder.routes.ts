import { Router } from "express";
import { ReminderController } from "./reminder.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/send", checkAuth(Role.ADMIN), ReminderController.sendReminder);

export const ReminderRoutes = router;
