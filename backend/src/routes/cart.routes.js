  import { Router } from "express";
  import { authMiddleware } from "../middlewares/auth.middleware.js";

  import {
    addToCart,
    getCart,
    updateQuantity,
    removeCartItem,
    clearCart,
  } from "../controllers/cart.controller.js";

  const router = Router();

  // Add Product To Cart
  router.post(
    "/add-to-cart",
    authMiddleware,
    addToCart
  );

  // Get Logged In User Cart
  router.get(
    "/get-cart",
    authMiddleware,
    getCart
  );

  // Update Product Quantity
  router.put(
    "/update-cart",
    authMiddleware,
    updateQuantity
  );

  // Remove Single Item
  router.delete(
    "/remove-cart-item/:productId",
    authMiddleware,
    removeCartItem
  );

  // Clear Complete Cart
  router.delete(
    "/clear-cart",
    authMiddleware,
    clearCart
  );

  export default router;