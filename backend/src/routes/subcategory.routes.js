import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createSubCategory, deleteSubCategory, getCategoryWithSubCategories, getSubCategories, updateSubCategory } from "../controllers/subcategory.controller.js";
import upload from "../middlewares/multer.js";

const router = Router();

router.post("/create", authMiddleware, upload.single("image"), createSubCategory);
router.put("/:id", authMiddleware, upload.single("image"), updateSubCategory);
router.get("/", getSubCategories);
router.get("/:id/subcategories", getCategoryWithSubCategories);
router.delete("/:id", authMiddleware, deleteSubCategory);

export default router;