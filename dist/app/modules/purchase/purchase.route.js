"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const purchase_controller_1 = require("./purchase.controller");
const router = express_1.default.Router();
router.post("/checkout", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), purchase_controller_1.PurchaseController.createCheckoutSession);
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), purchase_controller_1.PurchaseController.getAllPurchases);
router.get("/verify", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), purchase_controller_1.PurchaseController.verifySession);
exports.PurchaseRoutes = router;
