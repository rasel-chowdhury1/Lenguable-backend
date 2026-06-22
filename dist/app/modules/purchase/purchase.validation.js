"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePurchaseZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreatePurchaseZodSchema = zod_1.default.object({
    packageId: zod_1.default.string({
        required_error: "Package ID is required",
    }),
});
