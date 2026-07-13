import prisma from "../db/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(
      new ApiResponse(
        400,
        "Email is required."
      )
    );
  }

  const existingSubscriber = await prisma.newsletter.findUnique({
    where: {
      email,
    },
  });

  if (existingSubscriber) {
    return res.status(409).json(
      new ApiResponse(
        409,
        "Email is already subscribed."
      )
    );
  }

  const subscriber = await prisma.newsletter.create({
    data: {
      email,
    },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Newsletter subscribed successfully.",
      subscriber
    )
  );
});

export const getNewsletterSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await prisma.newsletter.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Newsletter subscribers fetched successfully.",
      subscribers
    )
  );
});

export const deleteNewsletterSubscriber = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subscriber = await prisma.newsletter.findUnique({
    where: {
      id,
    },
  });

  if (!subscriber) {
    return res.status(404).json(
      new ApiResponse(
        404,
        "Subscriber not found."
      )
    );
  }

  await prisma.newsletter.delete({
    where: {
      id,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Subscriber deleted successfully."
    )
  );
});