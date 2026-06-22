import { BookingModel } from "../booking/booking.model";
import { PaymentModel } from "../payment/payment.model";
import { PayoutModel } from "../payout/payout.model";
import { StudentModel } from "../student/student.model";
import { TeacherModel } from "../teacher/teacher.model";

// Format a Date as "YYYY-MM-DD" using UTC values
const fmtUTC = (d: Date): string => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getCurrentWeekRange = (): { start: string; end: string } => {
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

const getWeekStart = (date: Date): string => {
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return fmtUTC(monday);
};

const getDateRange = (
  period: "weekly" | "monthly" | "all",
): { start: string; end: string } | null => {
  if (period === "weekly") {
    return getCurrentWeekRange();
  }
  if (period === "monthly") {
    const now = new Date();
    const start = fmtUTC(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    );
    const end = fmtUTC(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)),
    );
    return { start, end };
  }
  return null; // "all" → no filter
};

// 1. Overview stats
const getOverviewStats = async (
  period: "weekly" | "monthly" | "all" = "weekly",
) => {
  const range = getDateRange(period);
  const startTimeFilter = range
    ? {
        startTime: {
          $gte: new Date(`${range.start}T00:00:00Z`),
          $lte: new Date(`${range.end}T23:59:59Z`),
        },
      }
    : {};
  const paidAtFilter = range
    ? {
        paidAt: {
          $gte: new Date(`${range.start}T00:00:00Z`),
          $lte: new Date(`${range.end}T23:59:59Z`),
        },
      }
    : {};

  const [
    totalRevenueResult,
    activeStudents,
    activeTeachers,
    classesThisPeriod,
    unpaidEarningsResult,
  ] = await Promise.all([
    PaymentModel.aggregate([
      { $match: { status: "completed", ...paidAtFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    StudentModel.countDocuments(),
    TeacherModel.countDocuments(),

    // cancelledByStudent counts because teacher was paid
    BookingModel.countDocuments({
      status: { $nin: ["cancelled"] },
      ...startTimeFilter,
    }),

    TeacherModel.aggregate([
      { $group: { _id: null, total: { $sum: "$unpaidEarnings" } } },
    ]),
  ]);
  return {
    totalRevenue: totalRevenueResult[0]?.total ?? 0,
    activeStudents,
    activeTeachers,
    classesThisPeriod,
    unpaidTeacherEarnings: unpaidEarningsResult[0]?.total ?? 0,
    period,
  };


};

// 2. Weekly financials table
const getWeeklyFinancials = async (weeks: number = 4) => {
  const weekRanges: { start: string; end: string }[] = [];
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

  const [bookings, payouts, payments] = await Promise.all([
    // All non-free-cancelled bookings
    BookingModel.find(
      {
        status: { $nin: ["cancelled"] },
        startTime: {
          $gte: new Date(`${oldestStart}T00:00:00Z`),
          $lte: new Date(`${newestEnd}T23:59:59Z`),
        },
      },
      { startTime: 1, status: 1, _id: 0 },
    ).lean(),

    // Completed payouts to teachers
    PayoutModel.find(
      {
        status: "completed",
        createdAt: {
          $gte: new Date(`${oldestStart}T00:00:00Z`),
          $lte: new Date(`${newestEnd}T23:59:59Z`),
        },
      },
      { amount: 1, createdAt: 1, _id: 0 },
    ).lean(),

    // Completed student payments (revenue)
    PaymentModel.find(
      {
        status: "completed",
        paidAt: {
          $gte: new Date(`${oldestStart}T00:00:00Z`),
          $lte: new Date(`${newestEnd}T23:59:59Z`),
        },
      },
      { amount: 1, paidAt: 1, _id: 0 },
    ).lean(),
  ]);

  // Group booking counts by week start
  const countMap: Record<string, number> = {};
  for (const booking of bookings) {
    const weekStart = getWeekStart(new Date(booking.startTime));
    countMap[weekStart] = (countMap[weekStart] ?? 0) + 1;
  }

  // Group completed payout amounts by week start (actual paid out)
  const payoutMap: Record<string, number> = {};
  for (const payout of payouts) {
    if (!payout.createdAt) continue;
    const weekStart = getWeekStart(new Date(payout.createdAt));
    payoutMap[weekStart] = (payoutMap[weekStart] ?? 0) + payout.amount;
  }

  // Group revenue by week start (from student payments)
  const revenueMap: Record<string, number> = {};
  for (const payment of payments) {
    if (!payment.paidAt) continue;
    const weekStart = getWeekStart(new Date(payment.paidAt));
    revenueMap[weekStart] = (revenueMap[weekStart] ?? 0) + payment.amount;
  }

  // Unpaid earnings per teacher aggregated — not week-scoped (global snapshot)
  const unpaidResult = await TeacherModel.aggregate([
    { $group: { _id: null, total: { $sum: "$unpaidEarnings" } } },
  ]);
  const totalUnpaidEarnings = unpaidResult[0]?.total ?? 0;

  const formatLabel = (start: string, end: string): string => {
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const s = new Date(`${start}T00:00:00Z`).toLocaleDateString("en-US", opts);
    const e = new Date(`${end}T00:00:00Z`).toLocaleDateString("en-US", opts);
    return `${s} - ${e}`;
  };

  const TEACHER_CUT = 10;

  const rows = weekRanges.map(({ start, end }) => {
    const classesBooked = countMap[start] ?? 0;
    const estimatedTeacherEarnings = classesBooked * TEACHER_CUT;
    const actualPayouts = payoutMap[start] ?? 0;
    const revenue = revenueMap[start] ?? 0;
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

  const totals = rows.reduce(
    (acc, r) => ({
      classesBooked: acc.classesBooked + r.classesBooked,
      revenue: acc.revenue + r.revenue,
      estimatedTeacherEarnings:
        acc.estimatedTeacherEarnings + r.estimatedTeacherEarnings,
      actualPayouts: acc.actualPayouts + r.actualPayouts,
      netIncome: acc.netIncome + r.netIncome,
    }),
    {
      classesBooked: 0,
      revenue: 0,
      estimatedTeacherEarnings: 0,
      actualPayouts: 0,
      netIncome: 0,
    },
  );

  return { weeks: rows, totals, totalUnpaidEarnings };
};

// 3. Full dashboard
const getDashboardStats = async (
  period: "weekly" | "monthly" | "all" = "weekly",
  weeks: number = 4,
) => {
  const [overview, financials] = await Promise.all([
    getOverviewStats(period),
    getWeeklyFinancials(weeks),
  ]);

  return { overview, financials };
};

export const StatsService = {
  getOverviewStats,
  getWeeklyFinancials,
  getDashboardStats,
};
