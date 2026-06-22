import { Router } from "express";
import { WhatYouGetController } from "./whatYouGet.controller";
import { WhatYouGetValidation } from "./whatYouGet.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/",
  validateRequest(WhatYouGetValidation.createWhatYouGetSchema),
  WhatYouGetController.createWhatYouGet,
);

router.get("/", WhatYouGetController.getAllWhatYouGet);

router.get("/:id", WhatYouGetController.getWhatYouGetById);

router.patch(
  "/:id",
  validateRequest(WhatYouGetValidation.updateWhatYouGetSchema),
  WhatYouGetController.updateWhatYouGet,
);

router.delete("/:id", WhatYouGetController.deleteWhatYouGet);

export const WhatYouGetRoutes = router;
