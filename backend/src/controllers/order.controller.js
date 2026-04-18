import prisma from "../db/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import PDFDocument from "pdfkit";

// GET all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { id, role } = req.user;

  if (role === "Admin") {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
        shipping: true,
      },
    });

    return res.status(200).json(new ApiResponse(200, "Orders fetched", orders));
  }


  

  if (role === "Customer") {
    // Fetch orders where customerId matches the logged-in user's id
    const customerOrders = await prisma.order.findMany({
      where: {
        customerid: id,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
        shipping: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Customer orders fetched", customerOrders));
  }

  return res.status(403).json(new ApiResponse(403, "Unauthorized"));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
        },
      },
      shipping: true,
    },
  });

  if (!order) {
    return ApiError.send(res, 404, "Order not found");
  }

  return res.status(200).json(new ApiResponse(200, "Order fetched", order));
});

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shipping } = req.body;
  const createdby = req.user?.id;

  if (req.user?.role !== "Customer") {
    return ApiError.send(res, 403, "Only Customers can order products.");
  }

  if (!items || !items.length || !shipping) {
    return ApiError.send(res, 400, "Missing required fields.");
  }

  // Fetch products to validate stock and price
  const productIds = items.map((item) => item.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== items.length) {
    return ApiError.send(res, 400, "Some products are invalid.");
  }

  // Check stock availability and calculate total
  let total = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      return ApiError.send(res, 400, `Product ${item.id} not found.`);
    }
    if (product.stock < item.quantity) {
      return ApiError.send(
        res,
        400,
        `Insufficient stock for product ${product.name}`,
      );
    }
    total += product.price * item.quantity;
  }

  const newShipping = await prisma.shippingAddress.create({
    data: {
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      email: shipping.email,
      address: shipping.address,
      state: shipping.state,
      city: shipping.city,
      pinCode: shipping.pinCode,
    },
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const order = await prisma.$transaction(async (prisma) => {
    const orderCreated = await prisma.order.create({
      data: {
        customerid: createdby,
        total,
        createdby,
        payment: "Pending",
        paymentMode: req.body.paymentMethod || "COD",
        shippingId: newShipping.id,
        duedate: dueDate,
        items: {
          create: items.map((item) => ({
            productid: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
        shipping: true,
      },
    });

    // Update stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    return orderCreated;
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Order created Successfully", order));
});

export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { status, payment, duedate, cancelReason } = req.body;

  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) {
    return ApiError.send(res, 404, "Order not found");
  }

  // Convert formatted string (e.g., "June 21, 2025") to a Date object
  if (duedate) {
    const parsedDate = new Date(duedate);
    // Optional: check if it's a valid date
    if (isNaN(parsedDate.getTime())) {
      return ApiError.send(res, 400, "Invalid date format");
    }
    duedate = parsedDate;
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: status || existingOrder.status,
      payment: payment || existingOrder.payment,
      duedate: duedate || existingOrder.duedate,
      cancelReason: cancelReason || existingOrder.cancelReason,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Order updated", updatedOrder));
});

// DELETE order
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return ApiError.send(res, 400, "Order ID is required");
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existingOrder) {
    return ApiError.send(res, 404, "Order not found");
  }

  if (existingOrder.items.length > 0) {
    await prisma.orderItem.deleteMany({
      where: { orderid: id },
    });
  }

  await prisma.order.delete({ where: { id } });

  return res
    .status(200)
    .json(new ApiResponse(200, "Order deleted successfully"));
});

// invoice generation
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        shipping: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.id}.pdf`
    );

    doc.pipe(res);

    // COLORS & CONSTANTS
    const primaryColor = "#2A4150";
    const secondaryColor = "#64748B";
    const borderColor = "#E2E8F0";

    // HEADER (Logo & Invoice Info)
    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("AZZUNIQUE", 50, 50);

    doc
      .fillColor(secondaryColor)
      .fontSize(10)
      .font("Helvetica")
      .text("Premium E-commerce Solutions", 50, 80);

    doc
      .fillColor(primaryColor)
      .fontSize(20)
      .text("INVOICE", 350, 50, { align: "right", width: 200 });

    doc
      .fillColor(secondaryColor)
      .fontSize(9) 
      .font("Helvetica")
      .text(`Invoice No: ORD-${order.id}`, 250, 75, { align: "right", width: 300 }) 
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 250, 90, { align: "right", width: 300 });

    doc.moveDown(2);
    doc.moveTo(50, 115).lineTo(550, 115).strokeColor(borderColor).stroke();
    // BILLING & SHIPPING INFO
    const infoY = 140;
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Bill To:", 50, infoY)
      .text("Shipping Address:", 300, infoY);

    doc
      .fillColor(secondaryColor)
      .fontSize(10)
      .font("Helvetica")
      .text(order.customer?.name || "Customer", 50, infoY + 20)
      .text(order.customer?.email || "", 50, infoY + 35);

    if (order.shipping) {
      const s = order.shipping;
      doc
        .text(`${s.firstName} ${s.lastName}`, 300, infoY + 20)
        .text(`${s.address}`, 300, infoY + 35, { width: 200 })
        .text(`${s.city}, ${s.zip}`, 300, infoY + 50);
    }

    doc.moveDown(4);

    // ITEMS TABLE HEADER
    const tableTop = 240;
    doc
      .rect(50, tableTop, 500, 25)
      .fill(primaryColor);

    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .text("Product", 60, tableTop + 7)
      .text("Qty", 350, tableTop + 7, { width: 50, align: "center" })
      .text("Price", 420, tableTop + 7, { width: 50, align: "right" })
      .text("Total", 480, tableTop + 7, { width: 60, align: "right" });

    // TABLE ROWS
    let currentY = tableTop + 25;
    
    order.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      
      // Zebra Striping logic
      if (index % 2 === 0) {
        doc.rect(50, currentY, 500, 25).fill("#F8FAFC");
      }

      doc
        .fillColor("#334155")
        .font("Helvetica")
        .text(item.product.name, 60, currentY + 7, { width: 280, lineBreak: false })
        .text(item.quantity.toString(), 350, currentY + 7, { width: 50, align: "center" })
        .text(`Rs.${item.price}`, 420, currentY + 7, { width: 50, align: "right" })
        .text(`Rs.${itemTotal}`, 480, currentY + 7, { width: 60, align: "right" });

      currentY += 25;
    });

    // TOTAL SECTION
    doc.moveTo(50, currentY + 10).lineTo(550, currentY + 10).strokeColor(borderColor).stroke();

    const footerY = currentY + 25;
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Grand Total:", 350, footerY)
      .text(`Rs.${order.total.toLocaleString()}`, 480, footerY, { width: 60, align: "right" });

    // FOOTER NOTE
    doc
      .fillColor(secondaryColor)
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text("Thank you for shopping with Azzunique!", 50, 750, { align: "center", width: 500 });

    doc.end();
  } catch (error) {
    console.log("Invoice Error:", error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};