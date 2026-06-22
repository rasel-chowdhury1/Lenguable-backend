"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const payout_controller_1 = require("./payout.controller");
const router = express_1.default.Router();
// Teacher — connect Stripe account
router.post("/connect", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), payout_controller_1.PayoutController.connectStripe);
// Teacher — check onboarding status (called on return from Stripe)
router.get("/onboarding-status", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), payout_controller_1.PayoutController.checkOnboardingStatus);
// Teacher — get own payout history
router.get("/my", (0, checkAuth_1.checkAuth)(user_interface_1.Role.TEACHER), payout_controller_1.PayoutController.getMyPayouts);
// Admin — get all payouts
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), payout_controller_1.PayoutController.getAllPayouts);
// Admin — manually trigger payouts (for testing)
router.post("/trigger", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), payout_controller_1.PayoutController.triggerAllPayouts);
exports.PayoutRoutes = router;
