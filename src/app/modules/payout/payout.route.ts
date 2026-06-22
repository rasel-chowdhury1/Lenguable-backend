import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { PayoutController } from "./payout.controller";

const router = express.Router();

// Teacher — connect Stripe account
router.post(
  "/connect",
  checkAuth(Role.TEACHER),
  PayoutController.connectStripe,
);

// Teacher — check onboarding status (called on return from Stripe)
router.get(
  "/onboarding-status",
  checkAuth(Role.TEACHER),
  PayoutController.checkOnboardingStatus,
);

// Teacher — get own payout history
router.get(
  "/my",
  checkAuth(Role.TEACHER),
  PayoutController.getMyPayouts,
);

// Admin — get all payouts
router.get(
  "/",
  checkAuth(Role.ADMIN),
  PayoutController.getAllPayouts,
);

// Admin — manually trigger payouts (for testing)
router.post(
  "/trigger",
  checkAuth(Role.ADMIN),
  PayoutController.triggerAllPayouts,
);

export const PayoutRoutes = router;