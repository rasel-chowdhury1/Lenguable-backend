"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCTA2 = exports.createCTA2 = void 0;
const zod_1 = require("zod");
exports.createCTA2 = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
});
exports.updateCTA2 = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
