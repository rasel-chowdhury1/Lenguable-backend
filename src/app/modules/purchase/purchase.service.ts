import { PurchaseModel } from "./purchase.model";
import { Types } from "mongoose";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { PackageModel } from "../package/package.model";
import { StudentModel } from "../student/student.model";
import { UserModel } from "../user/user.model";
import { PaymentService } from "../payment/payment.service";
import { DiscountCodeService } from "../discountCode/discountCode.service";
import stripe from "../../config/stripe";
import { envVars } from "../../config";
import { sendEmail } from "../../utils/sendEmail";

const createCheckoutSession = async (
  userId: string,
  packageId: string,
  discountCode?: string,
) => {
  
  const packageData = await PackageModel.findById(packageId);
  if (!packageData) {
    throw new AppError(httpStatus.NOT_FOUND, "Package not found");
  }

  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const student = await StudentModel.findById(user.student);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const originalPrice =
    packageData.discount && packageData.discount > 0
      ? packageData.price - (packageData.price * packageData.discount) / 100
      : packageData.price;

  let finalPrice = originalPrice;
  let discountAmount = 0;
  let appliedCodeId: string | null = null;

  if (discountCode) {
    const codeResult = await DiscountCodeService.claimCode(
      discountCode,
      packageId,
      student._id.toString(),
    );
    const codeDiscount = (finalPrice * codeResult.discountPercent) / 100;
    finalPrice = finalPrice - codeDiscount;
    discountAmount = codeDiscount;
    appliedCodeId = codeResult.codeId;
  }



  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(finalPrice * 100),
          product_data: {
            name: packageData.name,
            description: `${packageData.credits} credits${discountCode ? " (Discount applied)" : ""}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      packageId,
      studentId: student._id.toString(),
      appliedCodeId: appliedCodeId ?? "",
      discountCode: discountCode ?? "",
      originalPrice: originalPrice.toString(),
      discountAmount: discountAmount.toString(),
    },
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
  });

  await PaymentService.createPayment({
    studentId: student._id.toString(),
    packageId,
    stripeSessionId: session.id,
    originalPrice,
    discountAmount,
    amount: finalPrice,
    currency: "usd",
    discountCode: discountCode ?? null,
  });

  return { url: session.url, sessionId: session.id };
};

const fulfillPurchase = async (
  userId: string,
  packageId: string,
  studentId: string,
  stripeSessionId: string,
  stripePaymentIntentId: string,
  appliedCodeId?: string,
) => {
  const packageData = await PackageModel.findById(packageId);
  if (!packageData) {
    throw new AppError(httpStatus.NOT_FOUND, "Package not found");
  }

  const student = await StudentModel.findById(studentId);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Guard against duplicate webhook delivery
  const isAlreadyPurchased = await PurchaseModel.findOne({
    studentId: student._id,
    packageId,
  });

  if (isAlreadyPurchased) {
    return isAlreadyPurchased;
  }

  const finalPrice =
    packageData.discount && packageData.discount > 0
      ? packageData.price - (packageData.price * packageData.discount) / 100
      : packageData.price;

  const purchase = await PurchaseModel.create({
    studentId: new Types.ObjectId(student._id),
    packageId: new Types.ObjectId(packageId),
    price: finalPrice,
    credits: packageData.credits,
  });

  student.credits = (student.credits ?? 0) + packageData.credits;
  if (!student.packages) student.packages = [];
  student.packages.push(packageData._id);
  await student.save();

  const payment = await PaymentService.markPaymentCompleted(
    stripeSessionId,
    stripePaymentIntentId,
  );

  if (appliedCodeId) {
    await DiscountCodeService.markCodeAsUsed(
      appliedCodeId,
      student._id.toString(),
    );
  }

  if (student.email) {
    sendEmail({
      to: student.email,
      subject: "Payment Confirmed — Credits Added to Your Account",
      templateName: "paymentSuccess",
      templateData: {
        studentName: student.name || "there",
        packageName: packageData.name,
        credits: packageData.credits,
        originalPrice: payment.originalPrice,
        discountCode: payment.discountCode ?? null,
        discountAmount: payment.discountAmount,
        finalAmount: payment.amount,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }),
      },
    }).catch((err) => console.error("Failed to send payment confirmation email:", err));
  }

  return purchase;
};

const getAllPurchases = async () => {
  const purchases = await PurchaseModel.find()
    .populate("studentId", "name email")
    .populate("packageId", "name price credits")
    .sort({ createdAt: -1 });

  return purchases;
};

const verifyAndFulfillSession = async (sessionId: string, userId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment not completed");
  }

  const { packageId, studentId, appliedCodeId } = session.metadata as {
    packageId: string;
    studentId: string;
    appliedCodeId: string;
  };

  await fulfillPurchase(
    userId,
    packageId,
    studentId,
    session.id,
    session.payment_intent as string,
    appliedCodeId || undefined,
  );

  return { success: true };
};

export const PurchaseService = {
  createCheckoutSession,
  fulfillPurchase,
  getAllPurchases,
  verifyAndFulfillSession,
};
