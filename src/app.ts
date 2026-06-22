import express, { Application, Request, Response, urlencoded } from "express";
import router from "./app/routes";
import oauthRouter from "./app/routes/oauth.route";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
const app: Application = express();
import cors from "cors";
import { PurchaseController } from "./app/modules/purchase/purchase.controller";
import path from "path";
import { PayoutService } from "./app/modules/payout/payout.service";
import { logErrorHandler, logHttpRequests } from "./app/utils/logger";
import serverHomePage from "./app/helpers/serverHomePage";

app.use("/upload", express.static(path.join(process.cwd(), "upload")));

app.post(
  "/api/v1/purchase/webhook",
  express.raw({ type: "application/json" }),
  PurchaseController.stripeWebhook,
);

// Add this TEMP route
router.post("/admin/trigger-payout", async (req, res) => {
  const summary = await PayoutService.processAllTeacherPayouts();
  res.json(summary);
});

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://lenguable.com",
  "https://www.lenguable.com",
  "https://admin.lenguable.com",
  "https://tcp6n2f2-3000.inc1.devtunnels.ms",
];

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? allowedOrigins : true,
    credentials: true,
  }),
);

app.use(logHttpRequests);

// Routes
app.use("/api/v1", router);
app.use("/oauth", oauthRouter);

// Application Route
app.get("/", async (req: Request, res: Response) => {
  const htmlContent = await serverHomePage();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlContent);
});

// Error handler middleware
app.use(logErrorHandler);
// Global Error Handler
app.use(globalErrorHandler);

// Not Found Rote
app.use(notFound);

export default app;
