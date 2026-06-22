"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = require("../../middlewares/validateRequest");
const multer_config_1 = require("../../config/multer.config");
const about_validation_1 = require("./about.validation");
const about_controller_1 = require("./about.controller");
const router = (0, express_1.Router)();
// Parses JSON string fields sent via FormData before Zod validation
const parseFormDataFields = (req, res, next) => {
    if (req.body.stats && typeof req.body.stats === "string") {
        req.body.stats = JSON.parse(req.body.stats);
    }
    next();
};
router.post("/", multer_config_1.multerUpload.single("file"), parseFormDataFields, (0, validateRequest_1.validateRequest)(about_validation_1.AboutValidation.createAboutSchema), about_controller_1.AboutController.createAbout);
router.get("/", about_controller_1.AboutController.getAllAbout);
router.get("/:id", about_controller_1.AboutController.getAboutById);
router.patch("/:id", multer_config_1.multerUpload.single("file"), parseFormDataFields, (0, validateRequest_1.validateRequest)(about_validation_1.AboutValidation.updateAboutSchema), about_controller_1.AboutController.updateAbout);
router.delete("/:id", about_controller_1.AboutController.deleteAbout);
exports.AboutRoutes = router;
