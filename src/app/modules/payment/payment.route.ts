import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { PaymentController } from "./payment.controller";

const router = express.Router();

// Admin — get all payments
router.get(
  "/",
  checkAuth(Role.ADMIN),
  PaymentController.getAllPayments,
);

// Student — get their own payment history
router.get(
  "/my",
  checkAuth(Role.STUDENT),
  PaymentController.getMyPayments,
);

// Get single payment by Stripe session ID (used on success page)
router.get(
  "/session/:sessionId",
  checkAuth(Role.STUDENT),
  PaymentController.getPaymentBySessionId,
);

export const PaymentRoutes = router;