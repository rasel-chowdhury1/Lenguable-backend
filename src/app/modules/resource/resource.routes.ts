import { Router } from "express";
import { ResourceController } from "./resource.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createResourceZodSchema } from "./resource.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createResourceZodSchema),
  ResourceController.createResource,
);
router.get("/", ResourceController.getAllResources);
router.get("/:id", ResourceController.getSingleResource);
router.patch("/:id", ResourceController.updateResource);
router.delete("/:id", ResourceController.deleteResource);

export const ResourceRoutes = router;
