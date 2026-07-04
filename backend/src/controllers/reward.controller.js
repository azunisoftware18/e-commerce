import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get Reward Balance
const getRewardBalance = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      rewardPoints: true,
      lifetimePoints: true,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Reward balance fetched successfully.", {
      rewardPoints: user.rewardPoints,
      lifetimePoints: user.lifetimePoints,
    })
  );
});

// Reward History
const getRewardHistory = asyncHandler(async (req, res) => {
  const history = await prisma.rewardTransaction.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      order: {
        select: {
          id: true,
          total: true,
          date: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Reward history fetched successfully.", {
      history,
    })
  );
});

// Redeem Reward
const redeemReward = asyncHandler(async (req, res) => {
  const { points } = req.body;

  if (!points || points <= 0) {
    return ApiError.send(res, 400, "Invalid reward points.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (user.rewardPoints < points) {
    return ApiError.send(
      res,
      400,
      "Insufficient reward points."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        rewardPoints: {
          decrement: points,
        },
      },
    });

    await tx.rewardTransaction.create({
      data: {
        userId: req.user.id,
        points: -points,
        type: "REDEEMED",
        description: "Reward redeemed by customer",
      },
    });
  });

  return res.status(200).json(
    new ApiResponse(200, "Reward redeemed successfully.")
  );
});

export {
  getRewardBalance,
  getRewardHistory,
  redeemReward,
};