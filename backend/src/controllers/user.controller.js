import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import validator from "validator";
import crypto from "crypto";

import {
  comparePassword,
  generateAccessToken,
  hashPassword,
  cookieOptions,
  sendEmail,
  formattedJoinDate,
} from "../utils/utils.js";
import prisma from "../db/db.js";

// 🔄 Helper function to merge guest cart AND wishlist to user
const mergeGuestDataToUser = async (userId, sessionId) => {
  if (!sessionId) {
    console.log("⚠️ No sessionId provided, skipping merge");
    return;
  }

  try {
    // ==========================================
    // 🔥 MERGE GUEST CART
    // ==========================================
    console.log("🔍 Looking for guest cart with sessionId:", sessionId);
    
    const guestCart = await prisma.guestCart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (guestCart && guestCart.items.length > 0) {
      console.log(`📦 Found guest cart with ${guestCart.items.length} items`);
      
      let userCart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId },
        });
        console.log("🆕 Created new user cart");
      }

      for (const guestItem of guestCart.items) {
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            productId: guestItem.productId,
          },
        });

        const product = await prisma.product.findUnique({
          where: { id: guestItem.productId },
        });

        if (!product) {
          console.log(`⚠️ Product ${guestItem.productId} not found, skipping`);
          continue;
        }

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + guestItem.quantity,
            product.stock
          );
          console.log(`📝 Updating cart item: ${existingItem.id}, new qty: ${newQuantity}`);
          
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        } else if (product.stock > 0) {
          const quantityToAdd = Math.min(guestItem.quantity, product.stock);
          console.log(`➕ Adding to cart: ${guestItem.productId}, qty: ${quantityToAdd}`);
          
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: guestItem.productId,
              quantity: quantityToAdd,
            },
          });
        }
      }

      // Delete guest cart
      await prisma.guestCart.delete({
        where: { id: guestCart.id },
      });
      console.log("🗑️ Guest cart deleted");
    } else {
      console.log("⚠️ No guest cart found or empty");
    }

    // ==========================================
    // 🔥 MERGE GUEST WISHLIST
    // ==========================================
    console.log("🔍 Looking for guest wishlist with sessionId:", sessionId);
    
    const guestWishlist = await prisma.guestWishlist.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (guestWishlist && guestWishlist.items.length > 0) {
      console.log(`📦 Found guest wishlist with ${guestWishlist.items.length} items`);
      
      let userWishlist = await prisma.wishlist.findUnique({
        where: { userId },
      });

      if (!userWishlist) {
        userWishlist = await prisma.wishlist.create({
          data: { userId },
        });
        console.log("🆕 Created new user wishlist");
      }

      for (const guestItem of guestWishlist.items) {
        const existingItem = await prisma.wishlistItem.findFirst({
          where: {
            wishlistId: userWishlist.id,
            productId: guestItem.productId,
          },
        });

        if (!existingItem) {
          console.log(`➕ Adding to wishlist: ${guestItem.productId}`);
          
          await prisma.wishlistItem.create({
            data: {
              wishlistId: userWishlist.id,
              productId: guestItem.productId,
            },
          });
        } else {
          console.log(`⏭️ Wishlist item already exists: ${guestItem.productId}`);
        }
      }

      // Delete guest wishlist
      await prisma.guestWishlist.delete({
        where: { id: guestWishlist.id },
      });
      console.log("🗑️ Guest wishlist deleted");
    } else {
      console.log("⚠️ No guest wishlist found or empty");
    }

    console.log(`✅ All guest data merged for user ${userId}`);
  } catch (error) {
    console.error("❌ Merge error:", error);
    // Don't throw error - continue with login/signup even if merge fails
  }
};

// ✅ SIGNUP (Updated with cart & wishlist merge)
const signup = asyncHandler(async (req, res) => {
  const { name, location, email, phone, password, sessionId } = req.body;

  // 1️⃣ Validate required fields
  if (!name || !location || !email || !phone || !password) {
    return ApiError.send(
      res,
      400,
      "Name, location, email, phone, and password are required.",
    );
  }

  // 2️⃣ Validate email format
  if (!validator.isEmail(email)) {
    return ApiError.send(res, 400, "Invalid email format.");
  }

  // 3️⃣ Validate password strength
  if (!validator.isStrongPassword(password)) {
    return ApiError.send(
      res,
      400,
      "Password must be at least 8 characters long and include letters, numbers, and symbols.",
    );
  }

  // 4️⃣ Validate phone number
  if (!validator.isMobilePhone(phone, "any")) {
    return ApiError.send(res, 400, "Invalid mobile number.");
  }

  // 5️⃣ Check if email or phone already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    return ApiError.send(
      res,
      400,
      "User already exists with the given email or phone number.",
    );
  }

  // 6️⃣ Hash password
  const hashedPassword = await hashPassword(password);

  // 7️⃣ Create user
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim(),
      location,
      status: "Active",
      joinDate: new Date(),
    },
  });

  // 8️⃣ MERGE GUEST CART & WISHLIST (after user creation)
  if (sessionId) {
    console.log("🔄 Signup - merging guest data for sessionId:", sessionId);
    await mergeGuestDataToUser(newUser.id, sessionId);
  }

  // 9️⃣ Generate token
  const accessToken = generateAccessToken(
    newUser.id,
    newUser.email,
    newUser.role,
  );

  // 🔟 Prepare safe response
  const { password: _, ...userSafe } = newUser;

  const userSafeWithFormattedDate = {
    ...userSafe,
    joinDate: formattedJoinDate(newUser.joinDate),
  };

  // Send response with cookie
  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(201, "Signup successful.", {
        user: userSafeWithFormattedDate,
        accessToken,
      }),
    );
});

// ✅ LOGIN (Updated with cart & wishlist merge)
const login = asyncHandler(async (req, res) => {
  const { email, password, sessionId } = req.body;

  console.log("🔑 Login attempt:", { email, sessionId: sessionId || "none" });

  if (!email || !password) {
    return ApiError.send(res, 400, "Email and password are required.");
  }

  if (!validator.isEmail(email)) {
    return ApiError.send(res, 400, "Invalid email format.");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    return ApiError.send(res, 401, "Invalid credentials.");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return ApiError.send(res, 401, "Invalid credentials.");
  }

  await prisma.user.update({
    where: { email },
    data: { lastLogin: new Date() },
  });

  // 🔄 MERGE GUEST CART & WISHLIST (after successful login)
  if (sessionId) {
    console.log("🔄 Login - merging guest data for sessionId:", sessionId);
    await mergeGuestDataToUser(user.id, sessionId);
  } else {
    console.log("⚠️ No sessionId provided with login");
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);

  const { password: _, ...userSafe } = user;

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Login successful.", {
        user: userSafe,
        accessToken,
      }),
    );
});

// ✅ GET ALL USERS
const getAllUsers = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  let whereClause = {};

  if (currentUser?.role === "Admin") {
    whereClause = {
      role: {
        not: "Admin",
      },
    };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: { createdCategories: true },
    orderBy: { name: "asc" },
  });

  if (!users || users.length === 0) {
    return ApiError.send(res, 404, "No users found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully.", users));
});

// ✅ UPDATE ADMIN
const updateAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, location } = req.body;
  const { id } = req.user;

  const admin = await prisma.user.findUnique({ where: { id } });

  if (!admin) {
    return ApiError.send(res, 404, "Admin not found.");
  }

  const dataToUpdate = {};

  if (typeof name === "string" && name.trim()) {
    dataToUpdate.name = name.trim();
  }
  if (typeof email === "string" && email.trim()) {
    dataToUpdate.email = email.trim().toLowerCase();
  }
  if (typeof phone === "string" && phone.trim()) {
    dataToUpdate.phone = phone.trim();
  }
  if (typeof location === "string" && location.trim()) {
    dataToUpdate.location = location.trim();
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return ApiError.send(res, 400, "No valid fields provided for update.");
  }

  const updatedAdmin = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Admin updated successfully.", updatedAdmin));
});

// ✅ LOGOUT
const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie("accessToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, "Logout successful."));
});

// ✅ FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return ApiError.send(res, 400, "Email is required.");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "If an account exists, a reset email was sent."),
      );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { email },
    data: {
      token: hashedToken,
      resetTokenExpiry: tokenExpiry,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    text: `
    <div style="font-family:sans-serif;padding:20px">
      <h2>Password Reset</h2>
      <p>You requested a password reset.</p>

      <a 
        href="${resetUrl}" 
        style="
          background:#2A4150;
          color:white;
          padding:12px 20px;
          text-decoration:none;
          border-radius:8px;
          display:inline-block;
          margin-top:10px;
        "
      >
        Reset Password
      </a>

      <p style="margin-top:20px">
        This link expires in 15 minutes.
      </p>
    </div>
  `,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset email sent."));
});

// ✅ RESET PASSWORD (Logged-in user)
const resetPassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return ApiError.send(res, 401, "Unauthorized: User ID is missing.");
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return ApiError.send(
      res,
      400,
      "Current password, new password, and confirm password are required.",
    );
  }

  if (newPassword.length < 8) {
    return ApiError.send(
      res,
      400,
      "New password must be at least 8 characters.",
    );
  }

  if (newPassword !== confirmNewPassword) {
    return ApiError.send(
      res,
      400,
      "New password and confirm password do not match.",
    );
  }

  if (currentPassword === newPassword) {
    return ApiError.send(
      res,
      400,
      "New password must be different from the current password.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    return ApiError.send(res, 404, "User not found.");
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    return ApiError.send(res, 401, "Current password is incorrect.");
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully."));
});

// ✅ GET CURRENT USER
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return ApiError.send(res, 401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return ApiError.send(res, 404, "User not found");
  }

  const { password, ...userSafe } = user;

  return res.status(200).json(
    new ApiResponse(200, "User fetched successfully", {
      user: userSafe,
    })
  );
});

// ✅ RESET FORGOT PASSWORD (With token)
const resetForgotPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return ApiError.send(res, 400, "All fields are required");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      email,
      token: hashedToken,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return ApiError.send(res, 400, "Invalid or expired token");
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      token: null,
      resetTokenExpiry: null,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successful"));
});

export {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  resetForgotPassword,
  updateAdmin,
  getAllUsers,
  getMe,
};