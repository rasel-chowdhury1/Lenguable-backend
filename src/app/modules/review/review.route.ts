import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ReviewController } from "./review.controller";

const router = express.Router();

// Student — create a review
router.post("/", checkAuth(Role.STUDENT), ReviewController.createReview);

// Student — update own review
router.patch(
  "/:reviewId",
  checkAuth(Role.STUDENT),
  ReviewController.updateReview,
);

// Student — delete own review
router.delete(
  "/:reviewId",
  checkAuth(Role.STUDENT),
  ReviewController.deleteReview,
);

// Student — get own reviews
router.get("/my", checkAuth(Role.STUDENT), ReviewController.getMyReviews);

// Public — get reviews for a specific teacher
router.get("/teacher/:teacherId", ReviewController.getTeacherReviews);

// Admin — get all reviews
router.get("/", ReviewController.getAllReviews);

export const ReviewRoutes = router;
