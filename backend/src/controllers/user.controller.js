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

const signup = asyncHandler(async (req, res) => {
  const { name, location, email, phone, password } = req.body;

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
      status: "Active", // Default status for signup
      joinDate: new Date(), // Auto-set join date
    },
  });

  // 8️⃣ Generate token
  const accessToken = generateAccessToken(
    newUser.id,
    newUser.email,
    newUser.role,
  );

  // 9️⃣ Prepare safe response
  const { password: _, ...userSafe } = newUser;

  const userSafeWithFormattedDate = {
    ...userSafe,
    joinDate: formattedJoinDate(newUser.joinDate),
  };

  // 🔟 Send response with cookie
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

// ✅ LOGIN
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

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

const getAllUsers = asyncHandler(async (req, res) => {
  const currentUser = req.user; // Assuming user is set by authentication middleware

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

// ✅ RESET PASSWORD

const resetPassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return ApiError.send(res, 401, "Unauthorized: User ID is missing.");
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // Validate all fields
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
