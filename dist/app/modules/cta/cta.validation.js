"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTAValidation = void 0;
const zod_1 = require("zod");
const createCTASchema = zod_1.z.object({
    badgeText: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
});
const updateCTASchema = createCTASchema.partial();
exports.CTAValidation = {
    createCTASchema,
    updateCTASchema,
};
