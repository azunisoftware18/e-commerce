import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper function for user cart
const getOrCreateUserCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
};

// Helper function for guest cart
const getOrCreateGuestCart = async (sessionId) => {
  if (!sessionId) return null;

  let cart = await prisma.guestCart.findUnique({
    where: { sessionId },
  });

  if (!cart) {
    cart = await prisma.guestCart.create({
      data: { sessionId },
    });
  }

  return cart;
};

// Add To Cart (Works for both guest and logged-in users)
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, sessionId } = req.body;
  const userId = req.user?.id;

  if (!productId) {
    return ApiError.send(res, 400, "Product ID is required.");
  }

  // Check product exists and stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return ApiError.send(res, 404, "Product not found.");
  }

  if (product.stock < quantity) {
    return ApiError.send(res, 400, "Insufficient stock.");
  }

  let cartItem;

  if (userId) {
    // Logged-in user: add to user cart
    const cart = await getOrCreateUserCart(userId);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: {
          product: {
            include: { images: true }
          }
        }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: { images: true }
          }
        }
      });
    }
  } else if (sessionId) {
    // Guest user: add to guest cart
    const guestCart = await getOrCreateGuestCart(sessionId);

    if (!guestCart) {
      return ApiError.send(res, 400, "Session ID is required for guest users.");
    }

    const existingItem = await prisma.guestCartItem.findFirst({
      where: {
        guestCartId: guestCart.id,
        productId,
      },
    });

    if (existingItem) {
      cartItem = await prisma.guestCartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: {
          product: {
            include: { images: true }
          }
        }
      });
    } else {
      cartItem = await prisma.guestCartItem.create({
        data: {
          guestCartId: guestCart.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: { images: true }
          }
        }
      });
    }
  } else {
    return ApiError.send(res, 400, "Either login or provide session ID.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product added to cart.", { cartItem }));
});

// Get Cart (Merged for both)
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { sessionId } = req.query;

  console.log("🔍 Get Cart Request:", { userId, sessionId });

  let cartData = null;

  if (userId) {
    const cart = await getOrCreateUserCart(userId);
    cartData = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }, // 👈 Product details with images
            },
          },
        },
      },
    });
  } else if (sessionId) {
    // 🔥 FIX: Guest cart mein bhi product details include karo
    cartData = await prisma.guestCart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }, // 👈 Product details with images
            },
          },
        },
      },
    });
  } else {
    return ApiError.send(res, 400, "Either login or provide session ID.");
  }

  console.log("📦 Cart Data:", cartData?.items?.length, "items");
  
  return res
    .status(200)
    .json(new ApiResponse(200, "Cart fetched successfully.", { cart: cartData }));
});

// 🔴 MERGE GUEST CART TO USER CART (Called after login)
const mergeCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;

  if (!sessionId) {
    return ApiError.send(res, 400, "Session ID is required.");
  }

  // Get guest cart
  const guestCart = await prisma.guestCart.findUnique({
    where: { sessionId },
    include: {
      items: true,
    },
  });

  if (!guestCart || guestCart.items.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No items to merge."));
  }

  // Get or create user cart
  const userCart = await getOrCreateUserCart(userId);

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId: guestItem.productId,
      },
    });

    // Check product stock
    const product = await prisma.product.findUnique({
      where: { id: guestItem.productId },
    });

    if (!product || product.stock === 0) continue; // Skip out of stock

    if (existingItem) {
      // Update quantity with stock limit
      const newQuantity = Math.min(
        existingItem.quantity + guestItem.quantity,
        product.stock
      );
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item with stock limit
      const quantityToAdd = Math.min(guestItem.quantity, product.stock);
      
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: quantityToAdd,
        },
      });
    }
  }

  // Delete guest cart after merging
  await prisma.guestCart.delete({
    where: { id: guestCart.id },
  });

  // Return merged cart
  const mergedCart = await prisma.cart.findUnique({
    where: { id: userCart.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Cart merged successfully.", { cart: mergedCart }));
});

// Update Quantity (Works for both)
const updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity, sessionId } = req.body;
  const userId = req.user?.id;

  if (!quantity || quantity < 1) {
    return ApiError.send(res, 400, "Invalid quantity.");
  }

  let updated;

  if (userId) {
    const cart = await getOrCreateUserCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!item) {
      return ApiError.send(res, 404, "Cart item not found.");
    }

    updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  } else if (sessionId) {
    const guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
    });

    if (!guestCart) {
      return ApiError.send(res, 404, "Guest cart not found.");
    }

    const item = await prisma.guestCartItem.findFirst({
      where: { guestCartId: guestCart.id, productId },
    });

    if (!item) {
      return ApiError.send(res, 404, "Cart item not found.");
    }

    updated = await prisma.guestCartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Quantity updated.", { item: updated }));
});

// Remove Item (Works for both)
const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user?.id;
  const { sessionId } = req.body;

  if (userId) {
    const cart = await getOrCreateUserCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!item) {
      return ApiError.send(res, 404, "Cart item not found.");
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });
  } else if (sessionId) {
    const guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
    });

    if (!guestCart) {
      return ApiError.send(res, 404, "Guest cart not found.");
    }

    const item = await prisma.guestCartItem.findFirst({
      where: { guestCartId: guestCart.id, productId },
    });

    if (!item) {
      return ApiError.send(res, 404, "Cart item not found.");
    }

    await prisma.guestCartItem.delete({
      where: { id: item.id },
    });
  } else {
    return ApiError.send(res, 400, "Either login or provide session ID.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Item removed from cart."));
});

// Clear Cart (Works for both)
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { sessionId } = req.body;

  if (userId) {
    const cart = await getOrCreateUserCart(userId);
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  } else if (sessionId) {
    await prisma.guestCart.delete({
      where: { sessionId },
    });
  } else {
    return ApiError.send(res, 400, "Either login or provide session ID.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Cart cleared successfully."));
});

export {
  addToCart,
  getCart,
  updateQuantity,
  removeCartItem,
  clearCart,
  mergeCart,
};