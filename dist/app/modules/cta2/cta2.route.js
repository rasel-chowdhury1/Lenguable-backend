"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTA2Routes = void 0;
const express_1 = __importDefault(require("express"));
const cta2_controller_1 = require("./cta2.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const cta2_validation_1 = require("./cta2.validation");
const router = express_1.default.Router();
router.post("/", (0, validateRequest_1.validateRequest)(cta2_validation_1.createCTA2), cta2_controller_1.CTA2Controller.createCTA2);
router.get("/", cta2_controller_1.CTA2Controller.getCTA2);
router.patch("/:id", (0, validateRequest_1.validateRequest)(cta2_validation_1.updateCTA2), cta2_controller_1.CTA2Controller.updateCTA2);
router.delete("/:id", cta2_controller_1.CTA2Controller.deleteCTA2);
exports.CTA2Routes = router;
