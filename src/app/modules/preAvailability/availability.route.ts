import { Router } from "express";
import { AvailabilityController } from "./availability.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createAvailabilitySchema,
  updateSlotSchema,
} from "./availability.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.TEACHER),
  validateRequest(createAvailabilitySchema),
  AvailabilityController.createAvailability,
);

router.get(
  "/me",
  checkAuth(Role.TEACHER),
  AvailabilityController.getMyAvailability,
);

router.patch(
  "/:availabilityId/slots/:slotId",
  checkAuth(Role.TEACHER),
  validateRequest(updateSlotSchema),
  AvailabilityController.updateSlot,
);

router.delete(
  "/:availabilityId/slots/:slotId",
  checkAuth(Role.TEACHER),
  AvailabilityController.deleteSlot,
);

router.get(
  "/search",
  checkAuth(Role.STUDENT),
  AvailabilityController.searchTeachers,
);

router.get("/", AvailabilityController.getAllAvailability);

export const AvailabilityRoutes = router;
