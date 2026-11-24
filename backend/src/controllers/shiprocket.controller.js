import ShiprocketService from "../services/shiprocket.service.js";
import prisma from "../db/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { shiprocketConfig } from "../config/shiprocket.config.js";

export const loginShiprocket = asyncHandler(async (req, res) => {
  await ShiprocketService.login();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Shiprocket authentication successful"));
});

export const logoutShiprocket = asyncHandler(async (req, res) => {
  const result = await ShiprocketService.logout();

  res
    .status(200)
    .json(new ApiResponse(200, result, "Shiprocket logout successful"));
});

export const createShiprocketOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params; 

  // Only Admin can create Shiprocket orders
  if (req.user?.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can create Shiprocket orders",
    });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      shipping: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Prevent duplicate Shiprocket orders
  if (order.shiprocketOrderId) {
    return res.status(409).json({
      success: false,
      message: "Shiprocket order already exists",
      data: {
        shiprocketOrderId: order.shiprocketOrderId,
        shipmentId: order.shiprocketShipmentId,
      },
    });
  }

  // Allow COD orders or successfully paid prepaid orders
  const isCOD = order.paymentMode?.toUpperCase() === "COD";

  if (!isCOD && order.payment !== "Paid") {
    return res.status(400).json({
      success: false,
      message: "Prepaid order payment is not completed",
    });
  }

  const { customer, shipping, items } = order;

  if (!items.length) {
    return res.status(400).json({
      success: false,
      message: "Order has no items",
    });
  }

  if (!customer.phone || !shipping.pinCode) {
    return res.status(400).json({
      success: false,
      message: "Customer phone and shipping pincode are required",
    });
  }

  if (!shiprocketConfig.pickupLocation) {
    return res.status(500).json({
      success: false,
      message: "Shiprocket pickup location is not configured",
    });
  }

  const packageDimensions = [
    shiprocketConfig.length,
    shiprocketConfig.breadth,
    shiprocketConfig.height,
    shiprocketConfig.weight,
  ];

  if (
    packageDimensions.some(
      (value) => !Number.isFinite(value) || value <= 0,
    )
  ) {
    return res.status(500).json({
      success: false,
      message:
        "Shiprocket package dimensions and weight must be configured with positive values",
    });
  }

  const customerName = (customer.name || "").trim().split(/\s+/);
  const firstName = shipping.firstName || customerName[0] || "";
  const lastName = shipping.lastName || customerName.slice(1).join(" ");

  const orderSubtotal = Number(order.total);
  const totalDiscount = Number(order.discount || 0);

  const orderItems = items.map((item) => ({
    name: item.product.name,
    sku: item.product.id,
    units: item.quantity,
    selling_price: Number(item.price),
    discount: 0,
    tax: 0,
    hsn: "",
  }));

  const orderPayload = {
    order_id: `ECOM-${order.id}`,
    order_date: order.date.toISOString().slice(0, 19).replace("T", " "),
    pickup_location: shiprocketConfig.pickupLocation,

    comment: `Website order ${order.id}`,

    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: shipping.address,
    billing_address_2: "",
    billing_city: shipping.city,
    billing_pincode: shipping.pinCode,
    billing_state: shipping.state,
    billing_country: "India",
    billing_email: shipping.email || customer.email,
    billing_phone: customer.phone,

    shipping_is_billing: true,

    order_items: orderItems,

    payment_method: isCOD ? "COD" : "Prepaid",

    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: totalDiscount,

    sub_total: orderSubtotal,

    length: shiprocketConfig.length,
    breadth: shiprocketConfig.breadth,
    height: shiprocketConfig.height,
    weight: shiprocketConfig.weight,
  };

  const shiprocketResponse = await ShiprocketService.createOrder(orderPayload);

  if (!shiprocketResponse.order_id) {
    return res.status(502).json({
      success: false,
      message: "Shiprocket did not return an order ID",
      data: shiprocketResponse,
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      shiprocketOrderId: String(shiprocketResponse.order_id),
      shiprocketShipmentId: shiprocketResponse.shipment_id
        ? String(shiprocketResponse.shipment_id)
        : null,
      shiprocketStatus: "Order Created",
    },
  });

  return res.status(201).json({
    success: true,
    message: "Shiprocket order created successfully",
    data: {
      internalOrderId: updatedOrder.id,
      shiprocketOrderId: updatedOrder.shiprocketOrderId,
      shipmentId: updatedOrder.shiprocketShipmentId,
      shiprocketResponse,
    },
  });
});
