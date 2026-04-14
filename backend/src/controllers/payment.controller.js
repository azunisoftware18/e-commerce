import prisma from "../db/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";

//  RAZORPAY INSTANCE
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//  CREATE PAYMENT ORDER
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // ==============================
    // ❌ VALIDATION
    // ==============================
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // ==============================
    // 🔍 FETCH ORDER FROM DB
    // ==============================
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ❌ already paid check
    if (order.payment === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    // ==============================
    // 💰 CALCULATE AMOUNT (PAISE)
    // ==============================
    const amount = Math.round(order.total * 100);

    // ==============================
    // 🧾 CREATE RAZORPAY ORDER
    // ==============================
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: orderId, // 👈 IMPORTANT (link with DB order)
      notes: {
        orderId: orderId,
      },
    });

    // ==============================
    // 💾 UPDATE DB
    // ==============================
    await prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayOrderId: razorpayOrder.id,
        paymentMode: "ONLINE",
      },
    });

    // ==============================
    // ✅ RESPONSE
    // ==============================
    return res.status(200).json({
      success: true,
      message: "Razorpay order created",
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        paymentMode: "ONLINE",
      },
    });

  } catch (error) {
    console.error("❌ CREATE PAYMENT ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// ✅ VERIFY PAYMENT
export const verifyPayment = asyncHandler(async (req, res) => {
  try {
    console.log("================ VERIFY START ================");
    console.log("BODY:", req.body);

    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;

    console.log("ORDER ID:", razorpay_order_id);
    console.log("PAYMENT ID:", razorpay_payment_id);
    console.log("SIGNATURE:", razorpay_signature);

    // ❌ validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("❌ INVALID DATA");
      return res.status(400).json({
        success: false,
        message: "Invalid payment data",
      });
    }

    // 🔐 signature verify
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    console.log("EXPECTED:", expectedSignature);

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ SIGNATURE FAILED");
      return res.status(400).json({
        success: false,
        message: "Signature mismatch",
      });
    }

    console.log("✅ SIGNATURE VERIFIED");

    // 🔍 find order
    const order = await prisma.order.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
    });

    console.log("FOUND ORDER:", order);

    if (!order) {
      console.log("❌ ORDER NOT FOUND");
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // update
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        payment: "Paid",
        status: "Processing",
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    console.log("✅ UPDATED ORDER:", updated);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (error) {
    console.log("🔥 FULL ERROR:", error); // 👈 THIS IS IMPORTANT

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
});