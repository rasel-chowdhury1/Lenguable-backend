import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DiscountCodeController } from "./discountCode.controller";

const router = express.Router();

// Admin
router.post(
  "/generate",
  checkAuth(Role.ADMIN),
  DiscountCodeController.generateCode,
);

router.get(
  "/",
//   checkAuth(Role.ADMIN),
  DiscountCodeController.getAllCodes,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  DiscountCodeController.deleteCode,
);

// Student
router.post(
  "/validate",
  checkAuth(Role.STUDENT),
  DiscountCodeController.validateCode,
);

export const DiscountCodeRoutes = router;