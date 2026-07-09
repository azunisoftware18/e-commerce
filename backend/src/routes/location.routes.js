import express from "express";
import { getCities, getLocationByPincode, getStates } from "../controllers/location.controller.js";

const router = express.Router();

router.get("/states", getStates);
router.get("/cities/:state", getCities);
router.get("/pincode/:pincode", getLocationByPincode);

export default router;