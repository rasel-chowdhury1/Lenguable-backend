import { Router } from "express";
import { BookingController } from "./booking.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.get("/admin", checkAuth(Role.ADMIN), BookingController.getAllBookings);

router.get("/join/:bookingId", BookingController.joinViaLink);

router.post("/", checkAuth(Role.STUDENT), BookingController.createBooking);

router.get(
  "/",
  checkAuth(Role.STUDENT, Role.TEACHER),
  BookingController.getMyBookings,
);

router.patch(
  "/:bookingId/cancel",
  checkAuth(Role.STUDENT, Role.TEACHER),
  BookingController.cancelBooking,
);

router.patch(
  "/:bookingId/teacher-joined",
  checkAuth(Role.TEACHER),
  BookingController.markTeacherJoined,
);

router.patch(
  "/:bookingId/student-joined",
  checkAuth(Role.STUDENT),
  BookingController.markStudentJoined,
);

router.delete(
  "/:bookingId",
  checkAuth(Role.ADMIN),
  BookingController.deleteBooking,
);

export const BookingRoutes = router;
