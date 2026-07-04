import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrCreateWishlist = async (userId) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
    });
  }

  return wishlist;
};

// Add To Wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
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

  const wishlist = await getOrCreateWishlist(userId);

  const exists = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  if (exists) {
    return ApiError.send(res, 400, "Product already in wishlist.");
  }

  const item = await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Product added to wishlist.", { item }));
});

// Get Wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const wishlist = await getOrCreateWishlist(userId);

  const data = await prisma.wishlist.findUnique({
    where: {
      id: wishlist.id,
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
    .json(new ApiResponse(200, "Wishlist fetched successfully.", { wishlist: data }));
});

// Remove Wishlist Item
const removeWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const wishlist = await getOrCreateWishlist(userId);

  const item = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  if (!item) {
    return ApiError.send(res, 404, "Wishlist item not found.");
  }

  await prisma.wishlistItem.delete({
    where: {
      id: item.id,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Product removed from wishlist."));
});

// Move Wishlist To Cart
const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  const wishlist = await getOrCreateWishlist(userId);

  const wishlistItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  if (!wishlistItem) {
    return ApiError.send(res, 404, "Wishlist item not found.");
  }

  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (existingCartItem) {
    await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: existingCartItem.quantity + 1,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: 1,
      },
    });
  }

  await prisma.wishlistItem.delete({
    where: {
      id: wishlistItem.id,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Product moved to cart."));
});

export {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
  moveToCart,
};