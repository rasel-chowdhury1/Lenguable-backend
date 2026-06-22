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
exports.PayoutService = void 0;
const payout_model_1 = require("./payout.model");
const teacher_model_1 = require("../teacher/teacher.model");
const stripe_1 = __importDefault(require("../../config/stripe"));
const config_1 = require("../../config");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const i18n_iso_countries_1 = __importDefault(require("i18n-iso-countries"));
// Register English language for country names
i18n_iso_countries_1.default.registerLocale(require("i18n-iso-countries/langs/en.json"));
const createStripeConnectAccount = (teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId);
    if (!teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    let accountId = (_a = teacher.stripeAccountId) !== null && _a !== void 0 ? _a : undefined;
    const targetCountry = i18n_iso_countries_1.default.getAlpha2Code(teacher.country || "", "en") || teacher.country;
    if (!targetCountry) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Please set your country in My Account before setting up payouts.");
    }
    if (accountId) {
        try {
            const account = yield stripe_1.default.accounts.retrieve(accountId);
            if (account.country !== targetCountry) {
                console.log("🔄 Country mismatch (Profile:", targetCountry, " vs Stripe:", account.country, "). Recreating account...");
                accountId = undefined;
            }
            else {
                console.log("✅ Existing account valid for country:", targetCountry);
            }
        }
        catch (err) {
            console.log("❌ Account invalid, clearing and recreating:", err.message);
            accountId = undefined;
        }
    }
    if (!accountId) {
        console.log("🔄 Creating new Stripe account for teacher:", teacherId);
        const isUS = targetCountry === "US";
        const account = yield stripe_1.default.accounts.create(Object.assign(Object.assign({ type: "express", country: targetCountry, email: teacher.email, capabilities: Object.assign(Object.assign({}, (isUS && { card_payments: { requested: true } })), { transfers: { requested: true } }) }, (!isUS && {
            tos_acceptance: {
                service_agreement: "recipient",
            },
        })), { settings: {
                payouts: {
                    schedule: {
                        interval: "weekly",
                        weekly_anchor: "sunday",
                    },
                },
            } }));
        accountId = account.id;
        console.log("✅ New Stripe account created:", accountId);
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, {
            stripeAccountId: accountId,
        });
    }
    const accountLink = yield stripe_1.default.accountLinks.create({
        account: accountId,
        refresh_url: `${config_1.envVars.FRONTEND_URL}/dashboard/teacher/stripe/connect`,
        return_url: `${config_1.envVars.FRONTEND_URL}/teacher/stripe/success`,
        type: "account_onboarding",
    });
    return { url: accountLink.url };
});
// Check if teacher completed Stripe onboarding
const checkStripeOnboardingStatus = (teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId);
    if (!teacher || !teacher.stripeAccountId) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Stripe account not found");
    }
    const account = yield stripe_1.default.accounts.retrieve(teacher.stripeAccountId);
    const isOnboarded = account.details_submitted;
    yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacherId, {
        stripeOnboarded: isOnboarded,
    });
    return { isOnboarded };
});
// Process payout for a single teacher
const processTeacherPayout = (teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const teacher = yield teacher_model_1.TeacherModel.findById(teacherId);
    if (!teacher) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Teacher not found");
    }
    if (!teacher.stripeAccountId || !teacher.stripeOnboarded) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Teacher has not completed Stripe onboarding");
    }
    const amount = (_a = teacher.unpaidEarnings) !== null && _a !== void 0 ? _a : 0;
    if (amount <= 0) {
        return { message: "No unpaid earnings", amount: 0 };
    }
    // Minimum payout check — Stripe requires at least $1 (100 cents)
    if (amount < 1) {
        return { message: "Amount below minimum payout threshold", amount };
    }
    const payout = yield payout_model_1.PayoutModel.create({
        teacherId: teacher._id,
        amount,
        status: "pending",
    });
    try {
        const transfer = yield stripe_1.default.transfers.create({
            amount: Math.round(amount * 100), // Math.round prevents floating point issues
            currency: "usd",
            destination: teacher.stripeAccountId,
            description: `Weekly payout for ${teacher.name}`,
            // Idempotency recommended for transfers (add idempotency key)
        });
        yield payout_model_1.PayoutModel.findByIdAndUpdate(payout._id, {
            status: "completed",
            stripeTransferId: transfer.id,
            paidAt: new Date(),
        });
        yield teacher_model_1.TeacherModel.findByIdAndUpdate(teacher._id, {
            $inc: {
                totalPaidOut: amount,
                unpaidEarnings: -amount,
            },
        });
        console.log(`✅ Paid $${amount} to teacher: ${teacher.name}`);
        return {
            success: true,
            teacherName: teacher.name,
            amount,
            transferId: transfer.id,
        };
    }
    catch (err) {
        yield payout_model_1.PayoutModel.findByIdAndUpdate(payout._id, {
            status: "failed",
            failureReason: err.message,
        });
        console.error(`❌ Payout failed for ${teacher.name}:`, err.message);
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, `Payout failed: ${err.message}`);
    }
});
// Process ALL teacher payouts — called by cron every Sunday
const processAllTeacherPayouts = () => __awaiter(void 0, void 0, void 0, function* () {
    const teachers = yield teacher_model_1.TeacherModel.find({
        stripeOnboarded: true,
        unpaidEarnings: { $gt: 0 },
    });
    console.log(`🔄 Processing payouts for ${teachers.length} teachers...`);
    if (teachers.length === 0) {
        console.log("ℹ️ No teachers with unpaid earnings");
        return { total: 0, successful: 0, failed: 0 };
    }
    const results = yield Promise.allSettled(teachers.map((teacher) => processTeacherPayout(teacher._id.toString())));
    // Log which teachers failed so you can debug
    results.forEach((result, index) => {
        var _a;
        if (result.status === "rejected") {
            console.error(`❌ Failed for teacher ${teachers[index].name}:`, (_a = result.reason) === null || _a === void 0 ? void 0 : _a.message);
        }
    });
    const summary = {
        total: teachers.length,
        successful: results.filter((r) => r.status === "fulfilled").length,
        failed: results.filter((r) => r.status === "rejected").length,
    };
    console.log(`✅ Payout summary:`, summary);
    return summary;
});
// Get all payouts (admin)
const getAllPayouts = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield payout_model_1.PayoutModel.find()
        .populate("teacherId", "name email totalEarnings unpaidEarnings totalPaidOut")
        .sort({ createdAt: -1 });
});
// Get payouts for a specific teacher
const getMyPayouts = (teacherId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield payout_model_1.PayoutModel.find({ teacherId }).sort({ createdAt: -1 });
});
exports.PayoutService = {
    createStripeConnectAccount,
    checkStripeOnboardingStatus,
    processTeacherPayout,
    processAllTeacherPayouts,
    getAllPayouts,
    getMyPayouts,
};
