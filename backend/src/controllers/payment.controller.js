
import axios from "axios";
import crypto from "node:crypto";
import prisma from "../db/db.js";

// ==================================================
// CASHFREE CONFIGURATION
// ==================================================

const CASHFREE_ENV = (
  process.env.CASHFREE_ENV || "SANDBOX"
)
  .trim()
  .toUpperCase();

const CASHFREE_API_VERSION =
  process.env.CASHFREE_API_VERSION || "2025-01-01";

const CASHFREE_BASE_URL =
  CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// ==================================================
// CASHFREE API REQUEST
// ==================================================

const cashfreeRequest = async (path, options = {}) => {
  const clientId = process.env.CASHFREE_CLIENT_ID?.trim();
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Cashfree credentials are missing in backend .env"
    );
  }

  try {
    const response = await axios({
      method: options.method || "GET",
      url: `${CASHFREE_BASE_URL}${path}`,
      data: options.body,
      headers: {
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": CASHFREE_API_VERSION,
        "Content-Type": "application/json",
        ...options.headers,
      },
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    const details = error.response?.data;

    console.error("CASHFREE API ERROR:", {
      status: error.response?.status,
      message: details?.message || error.message,
      type: details?.type,
      code: details?.code,
    });

    const apiError = new Error(
      details?.message || error.message || "Cashfree API failed"
    );

    apiError.status = error.response?.status || 502;
    throw apiError;
  }
};

// ==================================================
// HELPERS
// ==================================================

const getUserId = (req) =>
  String(req.user?.id ?? req.user?._id ?? "");

const getOrderCustomerId = (order) =>
  String(order?.customerid ?? order?.customerId ?? "");

const customerOwnsOrder = (req, order) => {
  const role = req.user?.role ?? req.user?._role;

  // Customer orders must belong to the logged-in customer.
  if (role === "Customer") {
    const userId = getUserId(req);
    const customerId = getOrderCustomerId(order);

    return Boolean(userId && customerId && userId === customerId);
  }

  // Only allow explicitly recognized privileged roles otherwise.
  return ["Admin", "Super Admin"].includes(role);
};

// ==================================================
// CREATE CASHFREE PAYMENT ORDER
// POST /api/payment/create
// Body: { "orderId": "YOUR_DATABASE_ORDER_ID" }
// ==================================================

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body || {};

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",i
      });
    }

    if (!customerOwnsOrder(req, order)) {
      return res.status(403).json({
        success: false,
        message: "You cannot pay for this order",
      });
    }

    if (order.payment === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    if (order.paymentMode !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "Order payment method is not ONLINE",
      });
    }

    const amount = Number(order.total);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const customer = order.customer;
    const customerId = getOrderCustomerId(order);
    const customerName = customer?.name?.trim();
    const customerEmail = customer?.email?.trim();

    // Cashfree requires a valid customer phone number.
    const customerPhone = String(
      customer?.phone ?? customer?.phoneNumber ?? ""
    )
      .replace(/\D/g, "")
      .slice(-10);

    if (
      !customerId ||
      !customerName ||
      !customerEmail ||
      !/^[6-9]\d{9}$/.test(customerPhone)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer ID, name, email and a valid Indian mobile number are required",
      });
    }

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");

    if (!frontendUrl) {
      return res.status(500).json({
        success: false,
        message: "FRONTEND_URL is missing in backend .env",
      });
    }

    // Cashfree order IDs must be unique.
    const cashfreeOrderId = `cf_${crypto.randomUUID().replaceAll("-", "")}`;

    const cashfreeOrder = await cashfreeRequest("/orders", {
      method: "POST",
      headers: {
        "x-idempotency-key": crypto.randomUUID(),
      },
      body: {
        order_id: cashfreeOrderId,
        order_amount: Number(amount.toFixed(2)),
        order_currency: "INR",

        customer_details: {
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },

        order_meta: {
  return_url: `${frontendUrl}/cart?payment=return&order_id=${encodeURIComponent(
    order.id
  )}`,
},
      },
    });

    if (
      !cashfreeOrder?.order_id ||
      !cashfreeOrder?.payment_session_id
    ) {
      throw new Error(
        "Cashfree did not return an order ID or payment session ID"
      );
    }

    // Save the Cashfree order ID in the Cashfree-specific column.ws 
    await prisma.order.update({
      where: { id: order.id },
      data: {
        cashfreeOrderId: cashfreeOrder.order_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cashfree payment order created successfully",
      data: {
        orderId: order.id,
        cashfreeOrderId: cashfreeOrder.order_id,
        paymentSessionId: cashfreeOrder.payment_session_id,
        amount: cashfreeOrder.order_amount,
        currency: cashfreeOrder.order_currency,
        environment:
          CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
      },
    });
  } catch (error) {
    console.error("CREATE CASHFREE PAYMENT ORDER FAILED:", {
      message: error.message,
      status: error.status,
    });

    if (error.status === 401) {
      return res.status(502).json({
        success: false,
        message:
          "Cashfree authentication failed. Check matching Sandbox API credentials.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create Cashfree payment order",
    });
  }
};

// ==================================================
// VERIFY CASHFREE PAYMENT
// POST /api/payment/verify
// Body: { "orderId": "YOUR_DATABASE_ORDER_ID" }
// ==================================================

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body || {};

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!customerOwnsOrder(req, order)) {
      return res.status(403).json({
        success: false,
        message: "You cannot verify this order",
      });
    }

    if (order.payment === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment has already been verified",
        data: {
          orderId: order.id,
          payment: "Paid",
        },
      });
    }

    const cashfreeOrderId = order.cashfreeOrderId;

    if (!cashfreeOrderId) {
      return res.status(400).json({
        success: false,
        message: "Cashfree order has not been created",
      });
    }

    // Fetch the order status directly from Cashfree.
    const cashfreeOrder = await cashfreeRequest(
      `/orders/${encodeURIComponent(cashfreeOrderId)}`
    );

    const expectedAmount = Number(order.total);
    const receivedAmount = Number(cashfreeOrder.order_amount);

    if (
      cashfreeOrder.order_status !== "PAID" ||
      cashfreeOrder.order_currency !== "INR" ||
      receivedAmount !== expectedAmount
    ) {
      return res.status(200).json({
        success: false,
        message: "Payment is not confirmed yet",
        data: {
          paymentStatus: cashfreeOrder.order_status,
        },
      });
    }

    // Update only if another request has not already marked it paid.
    await prisma.order.updateMany({
      where: {
        id: order.id,
        payment: { not: "Paid" },
        cashfreeOrderId,
      },
      data: {
        payment: "Paid",
      },
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    if (updatedOrder?.payment !== "Paid") {
      return res.status(409).json({
        success: false,
        message: "Could not update order payment status",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cashfree payment verified successfully",
      data: {
        orderId: updatedOrder.id,
        payment: updatedOrder.payment,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error("VERIFY CASHFREE PAYMENT FAILED:", {
      message: error.message,
      status: error.status,
    });

    if (error.status === 401) {
      return res.status(502).json({
        success: false,
        message:
          "Cashfree authentication failed. Check your API credentials.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Cashfree payment verification failed",
    });
  }
};
