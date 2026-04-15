import { Router } from "express";
import { sendMail } from "../controllers/sendmailControlller.js";

const router = Router();

router.post("/send-mail", sendMail);

export default router;
