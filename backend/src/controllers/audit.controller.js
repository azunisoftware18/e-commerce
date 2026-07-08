import prisma from "../db/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const logWebsiteVisit = asyncHandler(
  async (req, res) => {
    const userId = req.user?.id || null;

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    const userAgent =
      req.headers["user-agent"] || "Unknown";

    await prisma.auditLog.create({
      data: {
        userId,
        ipAddress,
        userAgent,
      },
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        "Website visit logged successfully."
      )
    );
  }
);  

export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Audit logs fetched successfully.",
      logs
    )
  );
});