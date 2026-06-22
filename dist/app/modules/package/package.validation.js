"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePackageZodSchema = exports.CreatePackageZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreatePackageZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ required_error: "Package name is required" })
        .min(2, "Name must be at least 2 characters"),
    price: zod_1.default
        .number({ required_error: "Price is required" })
        .min(0, "Price must be positive"),
    credits: zod_1.default
        .number({ required_error: "Credits are required" })
        .min(1, "Credits must be at least 1"),
    perClassPrice: zod_1.default.number().min(0).optional(),
    features: zod_1.default.array(zod_1.default.string()).min(1, "At least one feature is required"),
    isMostPopular: zod_1.default.boolean().optional(),
    discount: zod_1.default.number().optional(),
});
exports.UpdatePackageZodSchema = zod_1.default.object({
    name: zod_1.default.string().min(2, "Name must be at least 2 characters").optional(),
    price: zod_1.default.number().min(0, "Price must be positive").optional(),
    credits: zod_1.default.number().min(1, "Credits must be at least 1").optional(),
    perClassPrice: zod_1.default
        .number()
        .min(0, "Per class price must be positive")
        .optional(),
    features: zod_1.default
        .array(zod_1.default.string())
        .min(1, "At least one feature is required")
        .optional(),
    isMostPopular: zod_1.default.boolean().optional(),
    discount: zod_1.default.number().optional(),
});
