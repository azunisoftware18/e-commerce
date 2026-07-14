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

// Add To Wishlist (Guest & Logged-in dono ke liye)
router.post(
  "/add-to-wishlist",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  addToWishlist
);

// Get Wishlist (Guest & Logged-in dono ke liye)
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

// Remove Wishlist Item (Guest & Logged-in dono ke liye)
router.delete(
  "/remove-wishlist-item/:productId",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  removeWishlistItem
);

// Move To Cart (Guest & Logged-in dono ke liye)
router.post(
  "/move-to-cart",
  optionalAuthMiddleware, // 👈 Changed from authMiddleware
  moveToCart
);

export default router;