import express from "express";
import {
  getDietPlans,
  getDietPlanById,
  deleteDietPlan,
  createDietPlan,
  downloadDietPlan,
  updateDietPlan,
} from "../controllers/dietPlan.controller.js";

import upload from "../middlewares/multer.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// CREATE
router.post(
  "/create",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createDietPlan
);

// UPDATE
router.put(
  "/:id",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateDietPlan
);

// GET ALL
router.get("/", getDietPlans);

// DOWNLOAD FIRST (IMPORTANT)
router.get("/download/:id", authMiddleware, downloadDietPlan);

// GET SINGLE
router.get("/:id", getDietPlanById);

// DELETE
router.delete("/:id", deleteDietPlan);

export default router;