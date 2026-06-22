import { Router } from "express";
import { FAQController } from "./faq.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { FAQValidation } from "./faq.validation";

const router = Router();

router.post(
  "/",
  validateRequest(FAQValidation.createFAQSchema),
  FAQController.createFAQ,
);

router.get("/", FAQController.getAllFAQ);

router.get("/:id", FAQController.getFAQById);

router.patch(
  "/:id",
  validateRequest(FAQValidation.updateFAQSchema),
  FAQController.updateFAQ,
);

router.delete("/:id", FAQController.deleteFAQ);

export const FAQRoutes = router;
