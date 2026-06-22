import { PaymentModel } from "./payment.model";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { StudentModel } from "../student/student.model";

// Create a pending payment record when checkout session is created
const createPayment = async (data: {
  studentId: string;
  packageId: string;
  stripeSessionId: string;
  originalPrice: number;
  discountAmount: number;
  amount: number;
  currency?: string;
  discountCode?: string | null;
}) => {
  const payment = await PaymentModel.create({
    studentId: data.studentId,
    packageId: data.packageId,
    stripeSessionId: data.stripeSessionId,
    originalPrice: data.originalPrice,
    discountAmount: data.discountAmount,
    amount: data.amount,
    currency: data.currency || "usd",
    discountCode: data.discountCode ?? null,
    status: "pending",
  });

  // Push payment reference into the student's payment array
  await StudentModel.findByIdAndUpdate(
    data.studentId,
    { $push: { payment: payment._id } },
    { new: true },
  );

  return payment;
};

// Mark payment as completed after webhook confirms
const markPaymentCompleted = async (
  stripeSessionId: string,
  stripePaymentIntentId: string,
) => {
  const payment = await PaymentModel.findOneAndUpdate(
    { stripeSessionId }, // ✅ must match exact field name in your model
    {
      status: "completed",
      stripePaymentIntentId,
      paidAt: new Date(),
    },
    { new: true },
  );

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment record not found");
  }

  return payment;
};

// Get all payments (admin)
const getAllPayments = async () => {
  const payments = await PaymentModel.find({status: {$ne: "pending"}})
    .populate("studentId", "name email")
    .populate("packageId", "name price credits")
    .sort({ createdAt: -1 });

  return payments;
};

// Get payments by student
const getMyPayments = async (studentId: string) => {
  const payments = await PaymentModel.find({ studentId })
    .populate("packageId", "name price credits")
    .sort({ createdAt: -1 });

  return payments;
};

// Get single payment
const getPaymentBySessionId = async (stripeSessionId: string) => {
  const payment = await PaymentModel.findOne({ stripeSessionId })
    .populate("studentId", "name email")
    .populate("packageId", "name price credits");

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  return payment;
};

export const PaymentService = {
  createPayment,
  markPaymentCompleted,
  getAllPayments,
  getMyPayments,
  getPaymentBySessionId,
};
