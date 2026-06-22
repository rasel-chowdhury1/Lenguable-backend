"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const student_route_1 = require("../modules/student/student.route");
const teacher_route_1 = require("../modules/teacher/teacher.route");
const otp_route_1 = require("../modules/otp/otp.route");
const package_route_1 = require("../modules/package/package.route");
const lesson_routes_1 = require("../modules/lesson/lesson.routes");
const resource_routes_1 = require("../modules/resource/resource.routes");
// import { AvailabilityRoutes } from "../modules/availability/availability.route";
const purchase_route_1 = require("../modules/purchase/purchase.route");
const note_route_1 = require("../modules/note/note.route");
const booking_route_1 = require("../modules/booking/booking.route");
const payment_route_1 = require("../modules/payment/payment.route");
const payout_route_1 = require("../modules/payout/payout.route");
const review_route_1 = require("../modules/review/review.route");
const stats_route_1 = require("../modules/stats/stats.route");
const announcement_routes_1 = require("../modules/announcement/announcement.routes");
const reminder_routes_1 = require("../modules/reminder/reminder.routes");
const hero_route_1 = require("../modules/hero/hero.route");
const howItWorks_route_1 = require("../modules/howitworks/howItWorks.route");
const whatYouGet_route_1 = require("../modules/whatYouGet/whatYouGet.route");
const our_story_route_1 = require("../modules/our-story/our-story.route");
const faq_routes_1 = require("../modules/faq/faq.routes");
const cta_routes_1 = require("../modules/cta/cta.routes");
const cta2_route_1 = require("../modules/cta2/cta2.route");
const discountCode_route_1 = require("../modules/discountCode/discountCode.route");
const about_route_1 = require("../modules/about/about.route");
const availability_route_1 = require("../modules/availability/availability.route");
// import { AvailabilityRoutes } from "../modules/availlabilityByTest/availability.route";
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        router: user_route_1.UserRoutes,
    },
    {
        path: "/auth",
        router: auth_route_1.AuthRoutes,
    },
    {
        path: "/student",
        router: student_route_1.StudentRoutes,
    },
    {
        path: "/teacher",
        router: teacher_route_1.TeacherRoutes,
    },
    {
        path: "/package",
        router: package_route_1.PackageRoutes,
    },
    {
        path: "/lesson",
        router: lesson_routes_1.LessonRoutes,
    },
    {
        path: "/resource",
        router: resource_routes_1.ResourceRoutes,
    },
    {
        path: "/note",
        router: note_route_1.NoteRoutes,
    },
    // {
    //   path: "/availability",
    //   router: AvailabilityRoutes,
    // },
    {
        path: "/booking",
        router: booking_route_1.BookingRoutes,
    },
    {
        path: "/purchase",
        router: purchase_route_1.PurchaseRoutes,
    },
    {
        path: "/payment",
        router: payment_route_1.PaymentRoutes,
    },
    {
        path: "/payout",
        router: payout_route_1.PayoutRoutes,
    },
    {
        path: "/otp",
        router: otp_route_1.OtpRoutes,
    },
    {
        path: "/review",
        router: review_route_1.ReviewRoutes,
    },
    {
        path: "/stats",
        router: stats_route_1.StatsRoutes,
    },
    {
        path: "/announcement",
        router: announcement_routes_1.AnnouncementRoutes,
    },
    {
        path: "/reminder",
        router: reminder_routes_1.ReminderRoutes,
    },
    {
        path: "/hero",
        router: hero_route_1.HeroRoutes,
    },
    {
        path: "/how-it-works",
        router: howItWorks_route_1.HowItWorksRoutes,
    },
    {
        path: "/what-you-get",
        router: whatYouGet_route_1.WhatYouGetRoutes,
    },
    {
        path: "/our-story",
        router: our_story_route_1.OurStoryRoutes,
    },
    {
        path: "/faq",
        router: faq_routes_1.FAQRoutes,
    },
    {
        path: "/cta",
        router: cta_routes_1.CTARoutes,
    },
    {
        path: "/cta-2",
        router: cta2_route_1.CTA2Routes,
    },
    {
        path: "/discount-code",
        router: discountCode_route_1.DiscountCodeRoutes,
    },
    {
        path: "/about",
        router: about_route_1.AboutRoutes,
    },
    {
        path: "/availability",
        router: availability_route_1.NewAvailabilityRoutes,
    },
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.router);
});
exports.default = router;
