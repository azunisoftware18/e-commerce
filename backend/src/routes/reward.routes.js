import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  getRewardBalance,
  getRewardHistory,
  redeemReward,
} from "../controllers/reward.controller.js";

const router = Router();

router.get(
  "/balance",
  authMiddleware,
  getRewardBalance
);

router.get(
  "/history",
  authMiddleware,
  getRewardHistory
);

router.post(
  "/redeem",
  authMiddleware,
  redeemReward
);

export default router;