import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { PurchaseService } from "./purchase.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import stripe from "../../config/stripe";
import { envVars } from "../../config";

// POST /purchase/checkout
const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = req.user.userId;
    const { packageId, discountCode } = req.body; // get discountCode

    const result = await PurchaseService.createCheckoutSession(
      studentId,
      packageId,
      discountCode, // pass it
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created",
      data: result,
    });
  },
);

// POST /purchase/webhook
const stripeWebhook = async (req: Request, res: Response) => {
  console.log("🔔 Webhook hit!");

  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      envVars.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status === "paid") {
      const { userId, packageId, studentId, appliedCodeId } =
        session.metadata as {
          userId: string;
          packageId: string;
          studentId: string;
          appliedCodeId: string;
        };

      if (!userId || !packageId || !studentId) {
        console.log("⚠️ Missing metadata — skipping fulfillment");
        return res.json({ received: true });
      }

      try {
        await PurchaseService.fulfillPurchase(
          userId,
          packageId,
          studentId,
          session.id,
          session.payment_intent as string,
          appliedCodeId || undefined, // pass code id
        );
        console.log(`✅ Purchase fulfilled — student: ${studentId}`);
      } catch (err) {
        console.error("❌ Error fulfilling purchase:", err);
        return res.status(500).json({ error: "Fulfillment failed" });
      }
    }
  }

  res.json({ received: true });
};

// GET /purchase — admin
const getAllPurchases = catchAsync(async (req: Request, res: Response) => {
  const result = await PurchaseService.getAllPurchases();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All purchases fetched successfully",
    data: result,
  });
});

// GET /purchase/verify?session_id=xxx
const verifySession = catchAsync(async (req: Request, res: Response) => {
  const { session_id } = req.query;
  const userId = req.user.userId;

  const result = await PurchaseService.verifyAndFulfillSession(
    session_id as string,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

export const PurchaseController = {
  createCheckoutSession,
  stripeWebhook,
  getAllPurchases,
  verifySession,
};
