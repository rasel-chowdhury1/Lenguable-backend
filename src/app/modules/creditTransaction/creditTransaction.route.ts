import { Router } from "express";
import { CreditTransactionController } from "./creditTransaction.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { adminAdjustCreditsZodSchema } from "./creditTransaction.validation";

const router = Router();

// Student: own credit history
router.get("/my", checkAuth(Role.STUDENT), CreditTransactionController.getMyTransactions);

// Admin: all credit transactions
router.get("/", checkAuth(Role.ADMIN), CreditTransactionController.getAllTransactions);

// Admin: credit transactions for a specific student
router.get(
  "/student/:studentId",
  checkAuth(Role.ADMIN),
  CreditTransactionController.getStudentTransactions,
);

// Admin: manually add or remove credits
router.post(
  "/adjust",
  checkAuth(Role.ADMIN),
  validateRequest(adminAdjustCreditsZodSchema),
  CreditTransactionController.adminAdjustCredits,
);

export const CreditTransactionRoutes = router;
