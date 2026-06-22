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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./app/routes"));
const oauth_route_1 = __importDefault(require("./app/routes/oauth.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const notFound_1 = require("./app/middlewares/notFound");
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const purchase_controller_1 = require("./app/modules/purchase/purchase.controller");
const path_1 = __importDefault(require("path"));
const payout_service_1 = require("./app/modules/payout/payout.service");
app.use("/upload", express_1.default.static(path_1.default.join(process.cwd(), "upload")));
app.post("/api/v1/purchase/webhook", express_1.default.raw({ type: "application/json" }), purchase_controller_1.PurchaseController.stripeWebhook);
// Add this TEMP route
routes_1.default.post("/admin/trigger-payout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const summary = yield payout_service_1.PayoutService.processAllTeacherPayouts();
    res.json(summary);
}));
// Middlewares
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.set("trust proxy", 1);
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://lenguable.com",
        "https://www.lenguable.com",
        "https://admin.lenguable.com",
        "https://tcp6n2f2-3000.inc1.devtunnels.ms"
    ],
    credentials: true,
}));
// Routes
app.use("/api/v1", routes_1.default);
app.use("/oauth", oauth_route_1.default);
// Application Route
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Welcome To Lenguable API",
    });
});
// Global Error Handler
app.use(globalErrorHandler_1.globalErrorHandler);
// Not Found Rote
app.use(notFound_1.notFound);
exports.default = app;
