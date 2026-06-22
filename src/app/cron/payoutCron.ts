import cron from "node-cron";
import { PayoutService } from "../modules/payout/payout.service";
import { WeeklyPayoutRunModel } from "../modules/weeklyPayoutRun/weeklyPayoutRun.model";
import { logger } from "../utils/logger";

// Returns the most recent Sunday at 08:00 UTC (or the current Sunday if today is Sunday)
const getWeekBoundaries = (from: Date): { weekStart: Date; weekEnd: Date } => {
  const d = new Date(from);
  const day = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(8, 0, 0, 0);
  d.setUTCMilliseconds(0);
  const weekStart = new Date(d);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { weekStart, weekEnd };
};

// Acquires an exclusive lock for this week's payout run by inserting a
// WeeklyPayoutRun document with status "processing".  The unique index on
// weekStart turns a duplicate-key error (11000) into a clean "already locked"
// signal so concurrent instances never double-pay.
const acquireWeeklyRun = async (
  weekStart: Date,
  weekEnd: Date,
): Promise<{ acquired: boolean; runId?: string }> => {
  try {


    const run = await WeeklyPayoutRunModel.create({
      weekStart,
      weekEnd,
      status: "processing",
      totalTeachers: 0,
      successful: 0,
      failed: 0,
      startedAt: new Date(),
    });
    return { acquired: true, runId: run._id.toString() };
  } catch (err: any) {
    if (err.code === 11000) {
      // Another instance already holds the lock for this week
      return { acquired: false };
    }
    throw err;
  }
};

const runWeeklyPayout = async (): Promise<void> => {
  const { weekStart, weekEnd } = getWeekBoundaries(new Date());


  console.log({weekStart, weekEnd})

  try {
    
  } catch (error) {
    
  }
  // Check if this week's run already completed (e.g. cron fired twice)
  const existingRun = await WeeklyPayoutRunModel.findOne({ weekStart });
  console.log({existingRun})
  if (existingRun) {
    if (existingRun.status === "completed") {
      logger.info(
        `[payoutCron] Payout for week of ${weekStart.toISOString()} already completed — skipping.`,
      );
      return;
    }
    if (existingRun.status === "processing") {
      logger.warn(
        `[payoutCron] Payout for week of ${weekStart.toISOString()} is still processing — another instance may be running.`,
      );
      return;
    }
    // status === "failed": allow retry — fall through to acquire lock below
    // Delete the failed record so we can re-insert with the unique index
    await WeeklyPayoutRunModel.deleteOne({ _id: existingRun._id });
  }

  const { acquired, runId } = await acquireWeeklyRun(weekStart, weekEnd);


  if (!acquired) {
    logger.warn(
      `[payoutCron] Could not acquire lock for week ${weekStart.toISOString()} — concurrent run detected.`,
    );
    return;
  }

  logger.info(`[payoutCron] Starting weekly payout for ${weekStart.toISOString()}`);

  try {
    const summary = await PayoutService.processAllTeacherPayouts(weekStart);

    await WeeklyPayoutRunModel.findByIdAndUpdate(runId, {
      status: "completed",
      totalTeachers: summary.total,
      successful: summary.successful,
      failed: summary.failed,
      completedAt: new Date(),
    });

    logger.info(
      `[payoutCron] Payout complete — total: ${summary.total}, ok: ${summary.successful}, failed: ${summary.failed}`,
    );
  } catch (err: any) {
    await WeeklyPayoutRunModel.findByIdAndUpdate(runId, {
      status: "failed",
      completedAt: new Date(),
    });
    logger.error(`[payoutCron] Payout run failed: ${err.message}`);
  }
};

// On every server start, check if the most recent Sunday's payout was missed.
// Intentionally also runs when today IS Sunday (server restarted after crash
// before or during the cron window).
const checkMissedPayout = async (): Promise<void> => {
  const now = new Date();
  const { weekStart } = getWeekBoundaries(now);

  // Only look for a missed payout if we are past Sunday 08:00 UTC
  if (now < weekStart) {
    return;
  }

  const existingRun = await WeeklyPayoutRunModel.findOne({ weekStart });
  if (!existingRun) {
    logger.warn(
      `[payoutCron] Missed payout detected for week ${weekStart.toISOString()} — running now.`,
    );
    await runWeeklyPayout();
  } else if (existingRun.status === "failed") {
    logger.warn(
      `[payoutCron] Previous payout run for ${weekStart.toISOString()} failed — retrying.`,
    );
    await runWeeklyPayout();
  } else {
    logger.info(
      `[payoutCron] Payout for ${weekStart.toISOString()} status: ${existingRun.status} — no action needed.`,
    );
  }
};

export const startPayoutCron = (): void => {
  // Scheduled Sunday at 08:00 UTC // "0 8 * * 0"
  cron.schedule("0 8 * * 0", () => { 
    runWeeklyPayout()
      .catch((err) => logger.error(`[payoutCron] Unhandled error: ${err.message}`)); }, { timezone: "UTC" });

  // Startup missed-payout detection (fire-and-forget)
  checkMissedPayout().catch((err) =>
    logger.error(`[payoutCron] Missed payout check error: ${err.message}`),
  );

  logger.info("[payoutCron] Payout cron scheduled (Sundays 08:00 UTC)");
};
