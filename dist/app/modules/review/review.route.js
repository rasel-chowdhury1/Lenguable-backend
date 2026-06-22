"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const review_controller_1 = require("./review.controller");
const router = express_1.default.Router();
// Student — create a review
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), review_controller_1.ReviewController.createReview);
// Student — update own review
router.patch("/:reviewId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), review_controller_1.ReviewController.updateReview);
// Student — delete own review
router.delete("/:reviewId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), review_controller_1.ReviewController.deleteReview);
// Student — get own reviews
router.get("/my", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), review_controller_1.ReviewController.getMyReviews);
// Public — get reviews for a specific teacher
router.get("/teacher/:teacherId", review_controller_1.ReviewController.getTeacherReviews);
// Admin — get all reviews
router.get("/", review_controller_1.ReviewController.getAllReviews);
exports.ReviewRoutes = router;
