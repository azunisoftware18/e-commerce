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

// Add a product to cart (for guests and signed-in users)
router.post(
  "/add-to-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  addToCart
);

// Get cart (for guests and signed-in users)
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

// Update product quantity (for guests and signed-in users)
router.put(
  "/update-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  updateQuantity
);

// Remove a single item (for guests and signed-in users)
router.delete(
  "/remove-cart-item/:productId",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  removeCartItem
);

// Clear the entire cart (for guests and signed-in users)
router.delete(
  "/clear-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  clearCart
);

export default router;
