import { Router } from "express";
import { getAuditLogs, logWebsiteVisit } from "../controllers/audit.controller.js";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

// Website Visit
router.post(
  "/visit",
  optionalAuthMiddleware,
  logWebsiteVisit,
);
router.get("/logs", getAuditLogs);

export default router;
