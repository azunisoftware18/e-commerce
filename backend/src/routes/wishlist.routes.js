import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
  moveToCart,
} from "../controllers/wishlist.controller.js";

const router = Router();

router.post(
  "/add-to-wishlist",
  authMiddleware,
  addToWishlist
);

router.get(
  "/get-wishlist",
  authMiddleware,
  getWishlist
);

router.delete(
  "/remove-wishlist-item/:productId",
  authMiddleware,
  removeWishlistItem
);

router.post(
  "/move-to-cart",
  authMiddleware,
  moveToCart
);

export default router;