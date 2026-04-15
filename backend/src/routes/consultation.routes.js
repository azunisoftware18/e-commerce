import express from "express";
import {
  getConsultations,
  getConsultationById,
  deleteConsultation,
  createConsultation,
} from "../controllers/consultation.controller.js";

const router = express.Router();

// CREATE
router.post("/create", createConsultation);

// GET ALL
router.get("/", getConsultations);

// GET SINGLE
router.get("/:id", getConsultationById);

// DELETE
router.delete("/:id", deleteConsultation);

export default router;