import express from "express";
import upload from "../middlewares/multer.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

import {
  upsertSetting,
  getSetting,
  deleteSetting,
} from "../controllers/setting.controller.js";

const router = express.Router();

// ✅ CREATE / UPDATE (Admin only)
router.post(
  "/",
  authMiddleware,         
  isAdmin,                
  upload.single("image"), 
  upsertSetting
);

// ✅ GET (public)
router.get("/", getSetting);

// ✅ DELETE (Admin only)
router.delete(
  "/",
  authMiddleware,
  isAdmin,
  deleteSetting
);

export default router;