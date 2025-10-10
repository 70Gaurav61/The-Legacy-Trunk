import express from "express";
import { scheduleMessage, getScheduledMessages } from "../controllers/scheduledMessageController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";

const router = express.Router();

router.post("/", verifyAuth, isFamilyMember, scheduleMessage);
router.get("/", verifyAuth, isFamilyMember, getScheduledMessages);

export default router;
