import { Router } from "express";
import { NewAvailabilityController } from "./availability.controller";
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
  NewAvailabilityController.createAvailability,
);

router.get(
  "/me",
  checkAuth(Role.TEACHER),
  NewAvailabilityController.getMyAvailability,
);

router.patch(
  "/:availabilityId/slots/:slotId",
  checkAuth(Role.TEACHER),
  validateRequest(updateSlotSchema),
  NewAvailabilityController.updateSlot,
);

router.delete(
  "/:availabilityId/slots/:slotId",
  checkAuth(Role.TEACHER),
  NewAvailabilityController.deleteSlot,
);

router.get(
  "/search",
  checkAuth(Role.STUDENT),
  NewAvailabilityController.searchTeachers,
);

router.get("/", NewAvailabilityController.getAllAvailability);

export const NewAvailabilityRoutes = router;
