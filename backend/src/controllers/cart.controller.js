import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrCreateCart = async (userId) => {
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

// Add To Cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return ApiError.send(res, 400, "Product ID is required.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return ApiError.send(res, 404, "Product not found.");
  }

  if (product.stock < quantity) {
    return ApiError.send(res, 400, "Insufficient stock.");
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  let cartItem;

  if (existingItem) {
    cartItem = await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product added to cart.", { cartItem }));
});

// Get Cart
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await getOrCreateCart(userId);

  const data = await prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Cart fetched successfully.", { cart: data }));
});

// Update Quantity
const updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!quantity || quantity < 1) {
    return ApiError.send(res, 400, "Invalid quantity.");
  }

  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (!item) {
    return ApiError.send(res, 404, "Cart item not found.");
  }

  const updated = await prisma.cartItem.update({
    where: {
      id: item.id,
    },
    data: {
      quantity,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Quantity updated.", { item: updated }));
});

// Remove Item
const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (!item) {
    return ApiError.send(res, 404, "Cart item not found.");
  }

  await prisma.cartItem.delete({
    where: {
      id: item.id,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Item removed from cart."));
});

// Clear Cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

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
};