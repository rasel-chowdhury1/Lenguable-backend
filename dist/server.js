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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./app/config");
const seedAdmin_1 = require("./app/utils/seedAdmin");
const redis_config_1 = require("./app/config/redis.config");
const payoutCron_1 = require("./app/cron/payoutCron");
const bookingCron_1 = require("./app/cron/bookingCron");
const reminderCron_1 = require("./app/cron/reminderCron");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(config_1.envVars.DB_URL);
        (0, redis_config_1.connectRedis)();
        (0, seedAdmin_1.adminSeed)();
        (0, payoutCron_1.startPayoutCron)(); // runs every Sunday 8AM (or every minute in test mode)
        (0, bookingCron_1.startBookingCron)(); // runs every hour — marks past bookings as completed
        (0, reminderCron_1.startReminderCron)(); // runs every hour — sends reminder emails for upcoming classes
        app_1.default.listen(config_1.envVars.PORT, () => {
            console.log(`Server is running on port ${config_1.envVars.PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
main();
