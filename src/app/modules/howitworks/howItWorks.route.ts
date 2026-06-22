import { Router } from "express";
import multer from "multer";
import { HowItWorksController } from "./howItWorks.controller";
import { HowItWorksValidation } from "./howItWorks.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/",
  multerUpload.single("file"),
  validateRequest(HowItWorksValidation.createHowItWorksSchema),
  HowItWorksController.createHowItWorks,
);

router.get("/", HowItWorksController.getAllHowItWorks);

router.get("/:id", HowItWorksController.getHowItWorksById);

router.patch(
  "/:id",
  multerUpload.single("file"),
  validateRequest(HowItWorksValidation.updateHowItWorksSchema),
  HowItWorksController.updateHowItWorks,
);

router.delete("/:id", HowItWorksController.deleteHowItWorks);

export const HowItWorksRoutes = router;
