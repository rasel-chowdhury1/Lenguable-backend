import express from "express";
import { CTA2Controller } from "./cta2.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createCTA2, updateCTA2 } from "./cta2.validation";

const router = express.Router();

router.post("/", validateRequest(createCTA2), CTA2Controller.createCTA2);
router.get("/", CTA2Controller.getCTA2);
router.patch("/:id", validateRequest(updateCTA2), CTA2Controller.updateCTA2);
router.delete("/:id", CTA2Controller.deleteCTA2);

export const CTA2Routes = router;
