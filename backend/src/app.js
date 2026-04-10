import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const data = "10mb";

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://d9vxjqxn-3000.inc1.devtunnels.ms", 
    ],
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json({ limit: data }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use("/uploads", express.static("public/uploads")); // local
app.use("/uploads", express.static("public/uploads"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import customerRouter from "./routes/customer.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import sendMail from "./routes/sendMail.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import subCategoryRoutes from "./routes/subcategory.routes.js";
import dietPlanRoutes from "./routes/dietPlan.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";

// routes declaration
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/subcategory", subCategoryRoutes);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1", sendMail);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/diet-plan", dietPlanRoutes);
app.use("/api/v1/consultation", consultationRoutes);

app.use((err, req, res, next) => {
  console.error("ERROR 💥", err);
  res.status(500).json({
    success: false,
    message: err.message || "Error occurred in the server.",
  });
});

export default app;
