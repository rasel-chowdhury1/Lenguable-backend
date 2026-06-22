"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHeroZodSchema = exports.createHeroZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createHeroZodSchema = zod_1.default.object({
    badge: zod_1.default.string({ required_error: "Badge is required" }),
    title: zod_1.default.string({ required_error: "Title is required" }),
    description: zod_1.default.string({ required_error: "Description is required" }),
    images: zod_1.default.array(zod_1.default.string()).optional(),
    cardTitle: zod_1.default.string({ required_error: "Card title is required" }),
    cardDescription: zod_1.default.string({ required_error: "Card description is required" }),
});
exports.updateHeroZodSchema = zod_1.default.object({
    badge: zod_1.default.string().optional(),
    title: zod_1.default.string().optional(),
    description: zod_1.default.string().optional(),
    cardTitle: zod_1.default.string().optional(),
    cardDescription: zod_1.default.string().optional(),
    images: zod_1.default.array(zod_1.default.string()).optional(),
});
