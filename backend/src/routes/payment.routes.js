import { Router } from "express";
import {
    createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware, createPaymentOrder);
router.post("/verify", authMiddleware, verifyPayment);

export default router;