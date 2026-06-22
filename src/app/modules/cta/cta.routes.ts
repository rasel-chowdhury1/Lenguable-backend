import { Router } from "express";
import { CTAController } from "./cta.controller";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { CTAValidation } from "./cta.validation";

const router = Router();

router.post(
  "/",
  multerUpload.single("file"),
  validateRequest(CTAValidation.createCTASchema),
  CTAController.createCTA
);

router.get("/", CTAController.getCTA);

router.patch(
  "/:id",
  multerUpload.single("file"),
  validateRequest(CTAValidation.updateCTASchema),
  CTAController.updateCTA
);

router.delete("/:id", CTAController.deleteCTA);

export const CTARoutes = router;