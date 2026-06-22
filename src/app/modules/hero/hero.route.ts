import { Router } from "express";
import { HeroController } from "./hero.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { createHeroZodSchema, updateHeroZodSchema } from "./hero.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN),
  multerUpload.array("files"),
  validateRequest(createHeroZodSchema),
  HeroController.createHero,
);

router.get("/", HeroController.getHero);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.array("files"),
  validateRequest(updateHeroZodSchema),
  HeroController.updateHero,
);

router.delete("/:id", checkAuth(Role.ADMIN), HeroController.deleteHero);

export const HeroRoutes = router;
