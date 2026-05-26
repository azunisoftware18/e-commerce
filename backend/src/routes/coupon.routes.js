import express from "express";

import {
  getCoupons,
  getCouponById,
  applyCoupon,
  updateCoupon,
  deleteCoupon,
  createCoupon,
  toggleCouponStatus,
} from "../controllers/coupon.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", createCoupon);

router.get("/", getCoupons);

router.get("/:id", getCouponById);

router.post("/apply", authMiddleware, applyCoupon);

router.put("/:id", updateCoupon);

router.delete("/:id", deleteCoupon);
router.patch("/toggle-status/:id", toggleCouponStatus);

export default router;
