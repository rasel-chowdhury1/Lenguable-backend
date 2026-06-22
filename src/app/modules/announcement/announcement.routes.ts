import { Router } from "express";
import { AnnouncementController } from "./announcement.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  CreateAnnouncementZodSchema,
  UpdateAnnouncementZodSchema,
} from "./announcement.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  validateRequest(CreateAnnouncementZodSchema),
  checkAuth(Role.ADMIN),
  AnnouncementController.createAnnouncement,
);

router.get("/", AnnouncementController.getAnnouncement);

router.patch(
  "/:id",
  validateRequest(UpdateAnnouncementZodSchema),
  checkAuth(Role.ADMIN),
  AnnouncementController.updateAnnouncement,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  AnnouncementController.deleteAnnouncement,
);

export const AnnouncementRoutes = router;
