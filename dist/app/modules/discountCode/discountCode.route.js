"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountCodeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const discountCode_controller_1 = require("./discountCode.controller");
const router = express_1.default.Router();
// Admin
router.post("/generate", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), discountCode_controller_1.DiscountCodeController.generateCode);
router.get("/", 
//   checkAuth(Role.ADMIN),
discountCode_controller_1.DiscountCodeController.getAllCodes);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), discountCode_controller_1.DiscountCodeController.deleteCode);
// Student
router.post("/validate", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), discountCode_controller_1.DiscountCodeController.validateCode);
exports.DiscountCodeRoutes = router;
