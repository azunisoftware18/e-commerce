import { Router } from "express";
import {
  forgotPassword,
  getAllUsers,
  getMe,
  login,
  logout,
  resetPassword,
  resetForgotPassword,
  signup,
  updateAdmin,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/update-admin", authMiddleware, updateAdmin);
router.get("/get-users", authMiddleware, getAllUsers);
router.post("/logout", authMiddleware, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", authMiddleware, resetPassword);
router.get("/me", authMiddleware, getMe);
router.post("/reset-forgot-password", resetForgotPassword);

export default router;
