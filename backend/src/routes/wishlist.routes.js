import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware.js"; // 👈 Import

import {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
  moveToCart,
  mergeWishlist, // 👈 Import mergeWishlist
} from "../controllers/wishlist.controller.js";

const router = Router();

// Add to wishlist (for guests and signed-in users)
router.post(
  "/add-to-wishlist",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  addToWishlist
);

// Get wishlist (for guests and signed-in users)
router.get(
  "/get-wishlist",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  getWishlist
);

// 🔴 NEW: Merge guest wishlist after login
router.post(
  "/merge-wishlist",
  authMiddleware, // 👈 Only logged-in users
  mergeWishlist
);

// Remove a wishlist item (for guests and signed-in users)
router.delete(
  "/remove-wishlist-item/:productId",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  removeWishlistItem
);

// Move to cart (for guests and signed-in users)
router.post(
  "/move-to-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  moveToCart
);

export default router;
