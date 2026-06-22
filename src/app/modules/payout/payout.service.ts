import { PayoutModel } from "./payout.model";
import { TeacherModel } from "../teacher/teacher.model";
import stripe from "../../config/stripe";
import { envVars } from "../../config";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { logger } from "../../utils/logger";
import countries from "i18n-iso-countries";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

// Returns Sunday 08:00 UTC for the week containing `from`
const getWeekSundayUTC = (from: Date): Date => {
  const d = new Date(from);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(8, 0, 0, 0);
  d.setUTCMilliseconds(0);
  return d;
};

const createStripeConnectAccount = async (teacherId: string) => {
  const teacher = await TeacherModel.findById(teacherId);
  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  let accountId: string | undefined = teacher.stripeAccountId ?? undefined;
  const targetCountry =
    countries.getAlpha2Code(teacher.country || "", "en") || teacher.country;

  if (!targetCountry) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please set your country in My Account before setting up payouts.",
    );
  }

  if (accountId) {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      if (account.country !== targetCountry) {
        accountId = undefined;
      }
    } catch {
      accountId = undefined;
    }
  }

  if (!accountId) {
    const isUS = targetCountry === "US";

    const account = await stripe.accounts.create({
      type: "express",
      country: targetCountry,
      email: teacher.email,
      capabilities: {
        ...(isUS && { card_payments: { requested: true } }),
        transfers: { requested: true },
      },
      ...(!isUS && { tos_acceptance: { service_agreement: "recipient" } }),
      settings: {
        payouts: {
          schedule: { interval: "weekly", weekly_anchor: "sunday" },
        },
      },
    });

    accountId = account.id;

    await TeacherModel.findByIdAndUpdate(teacherId, {
      stripeAccountId: accountId,
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${envVars.FRONTEND_URL}/dashboard/teacher/stripe/connect`,
    return_url: `${envVars.FRONTEND_URL}/teacher/stripe/success`,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
};

const checkStripeOnboardingStatus = async (teacherId: string) => {
  const teacher = await TeacherModel.findById(teacherId);
  if (!teacher || !teacher.stripeAccountId) {
    throw new AppError(httpStatus.NOT_FOUND, "Stripe account not found");
  }

  const account = await stripe.accounts.retrieve(teacher.stripeAccountId);
  const isOnboarded = account.details_submitted;

  await TeacherModel.findByIdAndUpdate(teacherId, { stripeOnboarded: isOnboarded });

  return { isOnboarded };
};

// Process payout for a single teacher.
// weekStart is used to build a Stripe idempotency key and to guard against
// duplicate payouts when the cron retries a crashed run.
const processTeacherPayout = async (teacherId: string, weekStart?: Date) => {
  const teacher = await TeacherModel.findById(teacherId);
  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  if (!teacher.stripeAccountId || !teacher.stripeOnboarded) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Teacher has not completed Stripe onboarding",
    );
  }

  const amount = teacher.unpaidEarnings ?? 0;
  if (amount <= 0) {
    return { skipped: true, reason: "No unpaid earnings", amount: 0 };
  }

  if (amount < 1) {
    return { skipped: true, reason: "Amount below minimum payout threshold", amount };
  }

  const effectiveWeekStart = weekStart ?? getWeekSundayUTC(new Date());
  const weekEnd = new Date(effectiveWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const idempotencyKey = `weekly-payout-${teacherId}-${effectiveWeekStart.toISOString()}`;

  // Guard: if a completed payout record already exists for this teacher this week
  // (possible after a crash that left unpaidEarnings unmodified), skip cleanly.
  const alreadyCompleted = await PayoutModel.findOne({
    teacherId: teacher._id,
    status: "completed",
    createdAt: { $gte: effectiveWeekStart, $lt: weekEnd },
  });

  if (alreadyCompleted) {
    return {
      skipped: true,
      reason: "Payout already completed this week",
      amount: alreadyCompleted.amount,
    };
  }

  // Reuse an existing pending record (from a prior partial run) rather than
  // creating a duplicate so the Payout history stays clean.
  let payout = await PayoutModel.findOne({
    teacherId: teacher._id,
    status: "pending",
    createdAt: { $gte: effectiveWeekStart, $lt: weekEnd },
  });

  if (!payout) {
    payout = await PayoutModel.create({
      teacherId: teacher._id,
      amount,
      status: "pending",
    });
  }

  try {
    const transfer = await stripe.transfers.create(
      {
        amount: Math.round(amount * 100),
        currency: "usd",
        destination: teacher.stripeAccountId,
        description: `Weekly payout for ${teacher.name}`,
      },
      { idempotencyKey },
    );

    await PayoutModel.findByIdAndUpdate(payout._id, {
      status: "completed",
      stripeTransferId: transfer.id,
      paidAt: new Date(),
    });

    await TeacherModel.findByIdAndUpdate(teacher._id, {
      $inc: { totalPaidOut: amount, unpaidEarnings: -amount },
    });

    logger.info(`[payout] Paid $${amount} to ${teacher.name} (transfer: ${transfer.id})`);

    return {
      success: true,
      teacherName: teacher.name,
      amount,
      transferId: transfer.id,
    };
  } catch (err: any) {
    await PayoutModel.findByIdAndUpdate(payout._id, {
      status: "failed",
      failureReason: err.message,
    });

    logger.error(`[payout] Failed for ${teacher.name}: ${err.message}`);

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Payout failed: ${err.message}`,
    );
  }
};

// Process all eligible teachers in one batch.
// weekStart is forwarded to processTeacherPayout for idempotency.
const processAllTeacherPayouts = async (weekStart?: Date) => {
  const teachers = await TeacherModel.find({
    stripeOnboarded: true,
    unpaidEarnings: { $gt: 0 },
  });

  if (teachers.length === 0) {
    logger.info("[payout] No teachers with unpaid earnings.");
    return { total: 0, successful: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    teachers.map((t) => processTeacherPayout(t._id.toString(), weekStart)),
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      logger.error(
        `[payout] Failed for ${teachers[i].name}: ${result.reason?.message}`,
      );
    }
  });

  return {
    total: teachers.length,
    successful: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
  };
};

const getAllPayouts = async () => {
  return PayoutModel.find()
    .populate("teacherId", "name email totalEarnings unpaidEarnings totalPaidOut")
    .sort({ createdAt: -1 });
};

const getMyPayouts = async (teacherId: string) => {
  return PayoutModel.find({ teacherId }).sort({ createdAt: -1 });
};

export const PayoutService = {
  createStripeConnectAccount,
  checkStripeOnboardingStatus,
  processTeacherPayout,
  processAllTeacherPayouts,
  getAllPayouts,
  getMyPayouts,
};
