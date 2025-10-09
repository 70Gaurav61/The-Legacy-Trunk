import express from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";

const router = express.Router();

router.get("/", verifyAuth, getNotifications);
router.put("/:notificationId/read", verifyAuth, markAsRead);

export default router;
