"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createResourceZodSchema = zod_1.default.object({
    title: zod_1.default.string({ required_error: "Title is required" }),
    url: zod_1.default.string({ required_error: "URL is required" }),
    type: zod_1.default.string({ required_error: "Type is required" }),
});
