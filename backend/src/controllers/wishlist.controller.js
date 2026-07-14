import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper: Get or create user wishlist
const getOrCreateUserWishlist = async (userId) => {
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

// Helper: Get or create guest wishlist
const getOrCreateGuestWishlist = async (sessionId) => {
  if (!sessionId) return null;

  let wishlist = await prisma.guestWishlist.findUnique({
    where: { sessionId },
  });

  if (!wishlist) {
    wishlist = await prisma.guestWishlist.create({
      data: { sessionId },
    });
  }

  return wishlist;
};

// Add To Wishlist (Guest & User)
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, sessionId } = req.body;
  const userId = req.user?.id;

  if (!productId) {
    return ApiError.send(res, 400, "Product ID is required.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return ApiError.send(res, 404, "Product not found.");
  }

  let wishlistItem;

  if (userId) {
    const wishlist = await getOrCreateUserWishlist(userId);

    const exists = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (exists) {
      return ApiError.send(res, 400, "Product already in wishlist.");
    }

    wishlistItem = await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
      include: { product: { include: { images: true } } }
    });
  } else if (sessionId) {
    const guestWishlist = await getOrCreateGuestWishlist(sessionId);

    if (!guestWishlist) {
      return ApiError.send(res, 400, "Session ID is required for guest users.");
    }

    const exists = await prisma.guestWishlistItem.findFirst({
      where: { guestWishlistId: guestWishlist.id, productId },
    });

    if (exists) {
      return ApiError.send(res, 400, "Product already in wishlist.");
    }

    wishlistItem = await prisma.guestWishlistItem.create({
      data: { guestWishlistId: guestWishlist.id, productId },
      include: { product: { include: { images: true } } }
    });
  } else {
    return ApiError.send(res, 400, "Either login or provide session ID.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Product added to wishlist.", { item: wishlistItem }));
});

// Get Wishlist (Guest & User)
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { sessionId } = req.query;

  let wishlistData = null;

  if (userId) {
    const wishlist = await getOrCreateUserWishlist(userId);
    wishlistData = await prisma.wishlist.findUnique({
      where: { id: wishlist.id },
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
  } else if (sessionId) {
    wishlistData = await prisma.guestWishlist.findUnique({
      where: { sessionId },
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
  } else {
    // Return empty wishlist if no userId or sessionId
    return res.status(200).json(
      new ApiResponse(200, "Wishlist fetched successfully.", { wishlist: { items: [] } })
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Wishlist fetched successfully.", { wishlist: wishlistData }));
});

// Remove Wishlist Item (Guest & User)
const removeWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user?.id;
  const { sessionId } = req.body;

  if (userId) {
    const wishlist = await getOrCreateUserWishlist(userId);
    const item = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!item) {
      return ApiError.send(res, 404, "Wishlist item not found.");
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });
  } else if (sessionId) {
    const guestWishlist = await prisma.guestWishlist.findUnique({
      where: { sessionId },
    });

    if (!guestWishlist) {
      return ApiError.send(res, 404, "Guest wishlist not found.");
    }

    const item = await prisma.guestWishlistItem.findFirst({
      where: { guestWishlistId: guestWishlist.id, productId },
    });

    if (!item) {
      return ApiError.send(res, 404, "Wishlist item not found.");
    }

    await prisma.guestWishlistItem.delete({ where: { id: item.id } });
  } else {
    return ApiError.send(res, 400, "Either login or provide session ID.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product removed from wishlist."));
});

// Move Wishlist To Cart (Guest & User)
const moveToCart = asyncHandler(async (req, res) => {
  const { productId, sessionId } = req.body;
  const userId = req.user?.id;

  if (!productId) {
    return ApiError.send(res, 400, "Product ID is required.");
  }

  if (userId) {
    // Remove from user wishlist
    const wishlist = await getOrCreateUserWishlist(userId);
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!wishlistItem) {
      return ApiError.send(res, 404, "Wishlist item not found.");
    }

    await prisma.wishlistItem.delete({ where: { id: wishlistItem.id } });

    // Add to user cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: 1 },
      });
    }
  } else if (sessionId) {
    // Remove from guest wishlist
    const guestWishlist = await prisma.guestWishlist.findUnique({
      where: { sessionId },
    });

    if (!guestWishlist) {
      return ApiError.send(res, 404, "Guest wishlist not found.");
    }

    const wishlistItem = await prisma.guestWishlistItem.findFirst({
      where: { guestWishlistId: guestWishlist.id, productId },
    });

    if (!wishlistItem) {
      return ApiError.send(res, 404, "Wishlist item not found.");
    }

    await prisma.guestWishlistItem.delete({ where: { id: wishlistItem.id } });

    // Add to guest cart
    let guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
    });

    if (!guestCart) {
      guestCart = await prisma.guestCart.create({ data: { sessionId } });
    }

    const existingCartItem = await prisma.guestCartItem.findFirst({
      where: { guestCartId: guestCart.id, productId },
    });

    if (existingCartItem) {
      await prisma.guestCartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    } else {
      await prisma.guestCartItem.create({
        data: { guestCartId: guestCart.id, productId, quantity: 1 },
      });
    }
  } else {
    return ApiError.send(res, 400, "Either login or provide session ID.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product moved to cart."));
});

// Merge Guest Wishlist (After login)
const mergeWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;

  if (!sessionId) {
    return ApiError.send(res, 400, "Session ID is required.");
  }

  const guestWishlist = await prisma.guestWishlist.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestWishlist || guestWishlist.items.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No wishlist items to merge."));
  }

  const userWishlist = await getOrCreateUserWishlist(userId);

  for (const guestItem of guestWishlist.items) {
    const existingItem = await prisma.wishlistItem.findFirst({
      where: { wishlistId: userWishlist.id, productId: guestItem.productId },
    });

    if (!existingItem) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: userWishlist.id,
          productId: guestItem.productId,
        },
      });
    }
  }

  await prisma.guestWishlist.delete({ where: { id: guestWishlist.id } });

  const mergedWishlist = await prisma.wishlist.findUnique({
    where: { id: userWishlist.id },
    include: {
      items: {
        include: { product: { include: { images: true } } },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Wishlist merged successfully.", { wishlist: mergedWishlist }));
});

export {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
  moveToCart,
  mergeWishlist,
};