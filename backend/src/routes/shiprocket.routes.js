import { Router } from "express";
import {
  createShiprocketOrder,
  loginShiprocket,
  logoutShiprocket,
} from "../controllers/shiprocket.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

router.post("/auth/login", authMiddleware, isAdmin, loginShiprocket);
router.post("/auth/logout", authMiddleware, isAdmin, logoutShiprocket);
router.post(
  "/orders/create/:orderId",
  authMiddleware,
  isAdmin,
  createShiprocketOrder,
);

export default router;
