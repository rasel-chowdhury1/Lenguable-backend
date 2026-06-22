import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { StudentRoutes } from "../modules/student/student.route";
import { TeacherRoutes } from "../modules/teacher/teacher.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { PackageRoutes } from "../modules/package/package.route";
import { LessonRoutes } from "../modules/lesson/lesson.routes";
import { ResourceRoutes } from "../modules/resource/resource.routes";
// import { AvailabilityRoutes } from "../modules/availability/availability.route";
import { PurchaseRoutes } from "../modules/purchase/purchase.route";
import { NoteRoutes } from "../modules/note/note.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { PayoutRoutes } from "../modules/payout/payout.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { StatsRoutes } from "../modules/stats/stats.route";
import { AnnouncementRoutes } from "../modules/announcement/announcement.routes";
import { ReminderRoutes } from "../modules/reminder/reminder.routes";
import { HeroRoutes } from "../modules/hero/hero.route";
import { HowItWorksRoutes } from "../modules/howitworks/howItWorks.route";
import { WhatYouGetRoutes } from "../modules/whatYouGet/whatYouGet.route";
import { OurStoryRoutes } from "../modules/our-story/our-story.route";
import { FAQRoutes } from "../modules/faq/faq.routes";
import { CTARoutes } from "../modules/cta/cta.routes";
import { CTA2Routes } from "../modules/cta2/cta2.route";
import { DiscountCodeRoutes } from "../modules/discountCode/discountCode.route";
import { AboutRoutes } from "../modules/about/about.route";
import { NewAvailabilityRoutes } from "../modules/availability/availability.route";
// import { AvailabilityRoutes } from "../modules/availlabilityByTest/availability.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    router: UserRoutes,
  },
  {
    path: "/auth",
    router: AuthRoutes,
  },
  {
    path: "/student",
    router: StudentRoutes,
  },
  {
    path: "/teacher",
    router: TeacherRoutes,
  },
  {
    path: "/package",
    router: PackageRoutes,
  },
  {
    path: "/lesson",
    router: LessonRoutes,
  },
  {
    path: "/resource",
    router: ResourceRoutes,
  },
  {
    path: "/note",
    router: NoteRoutes,
  },
  // {
  //   path: "/availability",
  //   router: AvailabilityRoutes,
  // },
  {
    path: "/booking",
    router: BookingRoutes,
  },
  {
    path: "/purchase",
    router: PurchaseRoutes,
  },
  {
    path: "/payment",
    router: PaymentRoutes,
  },
  {
    path: "/payout",
    router: PayoutRoutes,
  },
  {
    path: "/otp",
    router: OtpRoutes,
  },
  {
    path: "/review",
    router: ReviewRoutes,
  },
  {
    path: "/stats",
    router: StatsRoutes,
  },
  {
    path: "/announcement",
    router: AnnouncementRoutes,
  },
  {
    path: "/reminder",
    router: ReminderRoutes,
  },
  {
    path: "/hero",
    router: HeroRoutes,
  },
  {
    path: "/how-it-works",
    router: HowItWorksRoutes,
  },
  {
    path: "/what-you-get",
    router: WhatYouGetRoutes,
  },
  {
    path: "/our-story",
    router: OurStoryRoutes,
  },
  {
    path: "/faq",
    router: FAQRoutes,
  },
  {
    path: "/cta",
    router: CTARoutes,
  },
  {
    path: "/cta-2",
    router: CTA2Routes,
  },
  {
    path: "/discount-code",
    router: DiscountCodeRoutes,
  },
  {
    path: "/about",
    router: AboutRoutes,
  },
  {
    path: "/availability",
    router: NewAvailabilityRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
