import express from "express";
import { scheduleMessage, getScheduledMessages } from "../controllers/scheduledMessageController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";
import { upload } from "../middlewares/files/uploadMiddleware.js"; // 🟢 Import this

const router = express.Router();

// 🟢 Add 'upload.array' to handle multiple files
router.post("/", verifyAuth, isFamilyMember, upload.array("attachments"), scheduleMessage);

router.get("/", verifyAuth, isFamilyMember, getScheduledMessages);

export default router;