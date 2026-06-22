import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { PurchaseController } from "./purchase.controller";

const router = express.Router();

router.post(
  "/checkout",
  checkAuth(Role.STUDENT),
  PurchaseController.createCheckoutSession,
);

router.get("/", checkAuth(Role.ADMIN), PurchaseController.getAllPurchases);

router.get(
  "/verify",
  checkAuth(Role.STUDENT),
  PurchaseController.verifySession,
);

export const PurchaseRoutes = router;
