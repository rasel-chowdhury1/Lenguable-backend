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
exports.UserServices = void 0;
const user_model_1 = require("./user.model");
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId)
        .populate({
        path: "teacher",
        populate: [{ path: "availabilities" }, { path: "bookings" }],
    })
        .populate({
        path: "student",
        populate: [
            {
                path: "booking",
                populate: {
                    path: "teacherId",
                    select: "name email",
                },
            },
            { path: "packages" },
            {
                // payment is on student, not on user
                path: "payment",
                select: "amount currency status paidAt packageId stripeSessionId",
                populate: { path: "packageId", select: "name price credits" },
            },
        ],
    })
        .select("-password");
    return user;
});
exports.UserServices = {
    getMe,
};
