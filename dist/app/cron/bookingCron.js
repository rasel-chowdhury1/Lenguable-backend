"use strict";
// import cron from "node-cron";
// import { BookingModel } from "../modules/booking/booking.model";
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
exports.startBookingCron = void 0;
// export const startBookingCron = () => {
//   cron.schedule("0 * * * *", async () => {
//     //   cron.schedule("* * * * *", async () => {   Every minute
//     try {
//       const today = new Date().toISOString().split("T")[0];
//       const result = await BookingModel.updateMany(
//         {
//           status: "scheduled",
//           date: { $lte: today },
//         },
//         { $set: { status: "completed" } },
//       );
//       console.log(`✅ ${result.modifiedCount} bookings marked as completed`);
//     } catch (err) {
//       console.error("❌ Booking cron failed:", err);
//     }
//   });
//   console.log("✅ Booking cron scheduled — runs every hour");
// };
// import cron from "node-cron";
// import { BookingModel } from "../modules/booking/booking.model";
// export const startBookingCron = () => {
//   cron.schedule(
//     "0 * * * *",
//     async () => {
//       try {
//         const now = new Date();
//         const today = now.toISOString().split("T")[0];
//         const currentTime = now.toISOString().split("T")[1].slice(0, 5);
//         const result = await BookingModel.updateMany(
//           {
//             status: "scheduled",
//             $or: [
//               { date: { $lt: today } },
//               { date: today, startTime: { $lte: currentTime } },
//             ],
//           },
//           { $set: { status: "completed" } },
//         );
//         console.log(`✅ ${result.modifiedCount} bookings marked as completed`);
//       } catch (err) {
//         console.error("❌ Booking cron failed:", err);
//       }
//     },
//     { timezone: "UTC" },
//   );
//   console.log("✅ Booking cron scheduled");
// };
const node_cron_1 = __importDefault(require("node-cron"));
const booking_model_1 = require("../modules/booking/booking.model");
const teacher_model_1 = require("../modules/teacher/teacher.model");
const student_model_1 = require("../modules/student/student.model");
const startBookingCron = () => {
    node_cron_1.default.schedule("0 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const now = new Date();
            // Mark complete only after the 1-hour class has fully ended
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const bookingsToComplete = yield booking_model_1.BookingModel.find({
                status: "scheduled",
                startTime: { $lte: oneHourAgo },
            });
            for (const booking of bookingsToComplete) {
                booking.status = "completed";
                yield booking.save();
                if (booking.teacherJoined) {
                    // Teacher attended — pay them
                    yield teacher_model_1.TeacherModel.findByIdAndUpdate(booking.teacherId, {
                        $inc: {
                            totalEarnings: 10,
                            unpaidEarnings: 10,
                        },
                    });
                }
                else {
                    // Teacher no-show — refund student
                    yield student_model_1.StudentModel.findByIdAndUpdate(booking.studentId, {
                        $inc: { credits: 1 },
                    });
                    console.log(`⚠️ Teacher no-show for booking ${booking._id} — student refunded`);
                }
            }
            console.log(`✅ ${bookingsToComplete.length} bookings marked as completed`);
        }
        catch (err) {
            console.error("❌ Booking cron failed:", err);
        }
    }), { timezone: "UTC" });
    console.log("✅ Booking cron scheduled");
};
exports.startBookingCron = startBookingCron;
