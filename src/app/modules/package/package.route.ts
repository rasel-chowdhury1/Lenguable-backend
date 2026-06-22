import { Router } from "express";
import { PackageController } from "./package.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  CreatePackageZodSchema,
  UpdatePackageZodSchema,
} from "./package.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(CreatePackageZodSchema),
  PackageController.createPackage,
);

router.get("/", PackageController.getAllPackages);

router.get("/:id", PackageController.getSinglePackage);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(UpdatePackageZodSchema),
  PackageController.updatePackage,
);

router.delete("/:id", checkAuth(Role.ADMIN), PackageController.deletePackage);

export const PackageRoutes = router;
