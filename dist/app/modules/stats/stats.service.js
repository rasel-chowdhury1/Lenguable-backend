"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const booking_model_1 = require("../booking/booking.model");
const payment_model_1 = require("../payment/payment.model");
const payout_model_1 = require("../payout/payout.model");
const student_model_1 = require("../student/student.model");
const teacher_model_1 = require("../teacher/teacher.model");
// Format a Date as "YYYY-MM-DD" using UTC values
const fmtUTC = (d) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};
const getCurrentWeekRange = () => {
    const now = new Date();
    const day = now.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() + diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    return { start: fmtUTC(monday), end: fmtUTC(sunday) };
};
const getWeekStart = (date) => {
    const day = date.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() + diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);
    return fmtUTC(monday);
};
const getDateRange = (period) => {
    if (period === "weekly") {
        return getCurrentWeekRange();
    }
    if (period === "monthly") {
        const now = new Date();
        const start = fmtUTC(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
        const end = fmtUTC(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)));
        return { start, end };
    }
    return null; // "all" → no filter
};
// 1. Overview stats
const getOverviewStats = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (period = "weekly") {
    var _a, _b, _c, _d;
    const range = getDateRange(period);
    const dateFilter = range
        ? { date: { $gte: range.start, $lte: range.end } }
        : {};
    const dateFilterPayment = range
        ? {
            paidAt: {
                $gte: new Date(`${range.start}T00:00:00Z`),
                $lte: new Date(`${range.end}T23:59:59Z`),
            },
        }
        : {};
    const [totalRevenueResult, activeStudents, activeTeachers, classesThisPeriod, unpaidEarningsResult,] = yield Promise.all([
        // Total revenue from student payments — period-scoped
        payment_model_1.PaymentModel.aggregate([
            { $match: Object.assign({ status: "completed" }, dateFilterPayment) },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        student_model_1.StudentModel.countDocuments(),
        teacher_model_1.TeacherModel.countDocuments(),
        // Count all bookings except free cancellations
        // cancelledByStudent counts because teacher was paid
        booking_model_1.BookingModel.countDocuments(Object.assign({ status: { $nin: ["cancelled"] } }, dateFilter)),
        // Sum of all unpaid teacher earnings across all teachers
        teacher_model_1.TeacherModel.aggregate([
            { $group: { _id: null, total: { $sum: "$unpaidEarnings" } } },
        ]),
    ]);
    return {
        totalRevenue: (_b = (_a = totalRevenueResult[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0,
        activeStudents,
        activeTeachers,
        classesThisPeriod,
        unpaidTeacherEarnings: (_d = (_c = unpaidEarningsResult[0]) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0,
        period,
    };
});
// 2. Weekly financials table
const getWeeklyFinancials = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (weeks = 4) {
    var _a, _b, _c, _d, _e;
    const weekRanges = [];
    const now = new Date();
    for (let i = 0; i < weeks; i++) {
        const pivot = new Date(now);
        pivot.setUTCDate(now.getUTCDate() - i * 7);
        const start = getWeekStart(pivot);
        const startDate = new Date(`${start}T00:00:00Z`);
        const endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 6);
        weekRanges.push({ start, end: fmtUTC(endDate) });
    }
    const oldestStart = weekRanges[weekRanges.length - 1].start;
    const newestEnd = weekRanges[0].end;
    const [bookings, payouts, payments] = yield Promise.all([
        // All non-free-cancelled bookings
        booking_model_1.BookingModel.find({
            status: { $nin: ["cancelled"] },
            date: { $gte: oldestStart, $lte: newestEnd },
        }, { date: 1, status: 1, _id: 0 }).lean(),
        // Completed payouts to teachers
        payout_model_1.PayoutModel.find({
            status: "completed",
            createdAt: {
                $gte: new Date(`${oldestStart}T00:00:00Z`),
                $lte: new Date(`${newestEnd}T23:59:59Z`),
            },
        }, { amount: 1, createdAt: 1, _id: 0 }).lean(),
        // Completed student payments (revenue)
        payment_model_1.PaymentModel.find({
            status: "completed",
            paidAt: {
                $gte: new Date(`${oldestStart}T00:00:00Z`),
                $lte: new Date(`${newestEnd}T23:59:59Z`),
            },
        }, { amount: 1, paidAt: 1, _id: 0 }).lean(),
    ]);
    // Group booking counts by week start
    const countMap = {};
    for (const booking of bookings) {
        const weekStart = getWeekStart(new Date(booking.startTime));
        countMap[weekStart] = ((_a = countMap[weekStart]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    // Group completed payout amounts by week start (actual paid out)
    const payoutMap = {};
    for (const payout of payouts) {
        if (!payout.createdAt)
            continue;
        const weekStart = getWeekStart(new Date(payout.createdAt));
        payoutMap[weekStart] = ((_b = payoutMap[weekStart]) !== null && _b !== void 0 ? _b : 0) + payout.amount;
    }
    // Group revenue by week start (from student payments)
    const revenueMap = {};
    for (const payment of payments) {
        if (!payment.paidAt)
            continue;
        const weekStart = getWeekStart(new Date(payment.paidAt));
        revenueMap[weekStart] = ((_c = revenueMap[weekStart]) !== null && _c !== void 0 ? _c : 0) + payment.amount;
    }
    // Unpaid earnings per teacher aggregated — not week-scoped (global snapshot)
    const unpaidResult = yield teacher_model_1.TeacherModel.aggregate([
        { $group: { _id: null, total: { $sum: "$unpaidEarnings" } } },
    ]);
    const totalUnpaidEarnings = (_e = (_d = unpaidResult[0]) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : 0;
    const formatLabel = (start, end) => {
        const opts = { month: "short", day: "numeric" };
        const s = new Date(`${start}T00:00:00Z`).toLocaleDateString("en-US", opts);
        const e = new Date(`${end}T00:00:00Z`).toLocaleDateString("en-US", opts);
        return `${s} - ${e}`;
    };
    const TEACHER_CUT = 10;
    const rows = weekRanges.map(({ start, end }) => {
        var _a, _b, _c;
        const classesBooked = (_a = countMap[start]) !== null && _a !== void 0 ? _a : 0;
        const estimatedTeacherEarnings = classesBooked * TEACHER_CUT;
        const actualPayouts = (_b = payoutMap[start]) !== null && _b !== void 0 ? _b : 0;
        const revenue = (_c = revenueMap[start]) !== null && _c !== void 0 ? _c : 0;
        const netIncome = revenue - actualPayouts;
        return {
            weekOf: formatLabel(start, end),
            weekStart: start,
            weekEnd: end,
            classesBooked,
            revenue,
            estimatedTeacherEarnings, // what teachers earned this week ($10 x classes)
            actualPayouts, // what was actually transferred out via Stripe
            netIncome, // revenue minus actual payouts
        };
    });
    const totals = rows.reduce((acc, r) => ({
        classesBooked: acc.classesBooked + r.classesBooked,
        revenue: acc.revenue + r.revenue,
        estimatedTeacherEarnings: acc.estimatedTeacherEarnings + r.estimatedTeacherEarnings,
        actualPayouts: acc.actualPayouts + r.actualPayouts,
        netIncome: acc.netIncome + r.netIncome,
    }), {
        classesBooked: 0,
        revenue: 0,
        estimatedTeacherEarnings: 0,
        actualPayouts: 0,
        netIncome: 0,
    });
    return { weeks: rows, totals, totalUnpaidEarnings };
});
// 3. Full dashboard
const getDashboardStats = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (period = "weekly", weeks = 4) {
    const [overview, financials] = yield Promise.all([
        getOverviewStats(period),
        getWeeklyFinancials(weeks),
    ]);
    return { overview, financials };
});
exports.StatsService = {
    getOverviewStats,
    getWeeklyFinancials,
    getDashboardStats,
};
