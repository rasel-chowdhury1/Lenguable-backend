import { Router, Request, Response, NextFunction } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { multerUpload } from "../../config/multer.config";
import { AboutValidation } from "./about.validation";
import { AboutController } from "./about.controller";

const router = Router();

// Parses JSON string fields sent via FormData before Zod validation
const parseFormDataFields = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.stats && typeof req.body.stats === "string") {
    req.body.stats = JSON.parse(req.body.stats);
  }
  next();
};

router.post(
  "/",
  multerUpload.single("file"),
  parseFormDataFields,
  validateRequest(AboutValidation.createAboutSchema),
  AboutController.createAbout,
);

router.get("/", AboutController.getAllAbout);

router.get("/:id", AboutController.getAboutById);

router.patch(
  "/:id",
  multerUpload.single("file"),
  parseFormDataFields,
  validateRequest(AboutValidation.updateAboutSchema),
  AboutController.updateAbout,
);

router.delete("/:id", AboutController.deleteAbout);

export const AboutRoutes = router;