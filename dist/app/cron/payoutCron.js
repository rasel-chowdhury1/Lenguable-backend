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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPayoutCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const payout_model_1 = require("../modules/payout/payout.model");
const payout_service_1 = require("../modules/payout/payout.service");
const startPayoutCron = () => {
    // Runs every Sunday 8AM UTC
    node_cron_1.default.schedule("0 8 * * 0", () => __awaiter(void 0, void 0, void 0, function* () {
        yield runWeeklyPayout();
    }), { timezone: "UTC" });
    // Also check on every server startup if Sunday's payout was missed
    checkMissedPayout();
    console.log("✅ Payout cron scheduled");
};
exports.startPayoutCron = startPayoutCron;
const runWeeklyPayout = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("⏰ Running weekly payout...");
    // Prevent duplicate payouts — check if we already ran this week
    const now = new Date();
    const startOfWeek = getLastSundayUTC(now);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Check by a dedicated weekly payout log, not individual teacher records
    const alreadyRan = yield payout_model_1.PayoutModel.findOne({
        createdAt: { $gte: startOfWeek, $lt: endOfWeek },
        status: "completed",
    });
    if (alreadyRan) {
        // Only retry failed ones
        console.log("ℹ️ Payout already ran this week, checking for failed ones...");
        const failedPayouts = yield payout_model_1.PayoutModel.find({
            createdAt: { $gte: startOfWeek, $lt: endOfWeek },
            status: "failed",
        });
        if (failedPayouts.length > 0) {
            console.log(`⚠️ Retrying ${failedPayouts.length} failed payouts...`);
            for (const payout of failedPayouts) {
                yield payout_service_1.PayoutService.processTeacherPayout(payout.teacherId.toString());
            }
        }
        return;
    }
    try {
        const summary = yield payout_service_1.PayoutService.processAllTeacherPayouts();
        console.log("✅ Payout completed:", summary);
    }
    catch (err) {
        console.error("❌ Payout failed:", err);
    }
});
// On server start, check if this week's Sunday payout was missed
const checkMissedPayout = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    if (dayOfWeek === 0)
        return;
    const lastSunday = getLastSundayUTC(now);
    const nextSunday = new Date(lastSunday.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Only "completed" — pending/failed should be retried
    const alreadyRan = yield payout_model_1.PayoutModel.findOne({
        createdAt: { $gte: lastSunday, $lt: nextSunday },
        status: "completed",
    });
    if (!alreadyRan) {
        console.warn("⚠️ Missed Sunday payout detected — running now...");
        yield runWeeklyPayout();
    }
    else {
        console.log("✅ This week's payout already processed.");
    }
});
// Returns the most recent Sunday at 08:00 UTC
const getLastSundayUTC = (from) => {
    const d = new Date(from);
    const day = d.getUTCDay(); // 0=Sun
    d.setUTCDate(d.getUTCDate() - day); // rewind to Sunday
    d.setUTCHours(8, 0, 0, 0);
    return d;
};
