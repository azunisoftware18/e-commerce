import { Router } from "express";
import {
  subscribeNewsletter,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
} from "../controllers/newsletter.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.post("/subscribe", subscribeNewsletter);

// Protected
router.get("/", authMiddleware, getNewsletterSubscribers);
router.delete("/:id", authMiddleware, deleteNewsletterSubscriber);

export default router;