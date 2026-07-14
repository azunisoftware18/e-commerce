import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware.js"; // 👈 Import

import {
  addToCart,
  getCart,
  updateQuantity,
  removeCartItem,
  clearCart,
  mergeCart, // 👈 Import mergeCart
} from "../controllers/cart.controller.js";

const router = Router();

// Add Product To Cart (Guest & Logged-in dono ke liye)
router.post(
  "/add-to-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  addToCart
);

// Get Cart (Guest & Logged-in dono ke liye)
router.get(
  "/get-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  getCart
);

// 🔴 NEW: Merge guest cart after login
router.post(
  "/merge-cart",
  authMiddleware, // 👈 Only logged-in users
  mergeCart
);

// Update Product Quantity (Guest & Logged-in dono ke liye)
router.put(
  "/update-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  updateQuantity
);

// Remove Single Item (Guest & Logged-in dono ke liye)
router.delete(
  "/remove-cart-item/:productId",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  removeCartItem
);

// Clear Complete Cart (Guest & Logged-in dono ke liye)
router.delete(
  "/clear-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  clearCart
);

export default router;