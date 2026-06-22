import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { multerUpload } from "../../config/multer.config";
import { OurStoryValidation } from "./our-story.validation";
import { OurStoryController } from "./our-story.controller";

const router = Router();

router.post(
  "/",
  multerUpload.single("file"),
  validateRequest(OurStoryValidation.createOurStorySchema),
  OurStoryController.createOurStory,
);

router.get("/", OurStoryController.getAllOurStory);

router.get("/:id", OurStoryController.getOurStoryById);

router.patch(
  "/:id",
  multerUpload.single("file"),
  validateRequest(OurStoryValidation.updateOurStorySchema),
  OurStoryController.updateOurStory,
);

router.delete("/:id", OurStoryController.deleteOurStory);

export const OurStoryRoutes = router;
