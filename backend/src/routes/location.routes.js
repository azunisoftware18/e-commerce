import express from "express";
import { getCities, getStates } from "../controllers/location.controller.js";

const router = express.Router();

router.get("/states", getStates);
router.get("/cities/:state", getCities);

export default router;