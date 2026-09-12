import express from "express";
import { getUserProfile, updateUserProfile, changePassword, getUserMemories } from "../controllers/userController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { upload } from "../middlewares/files/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", verifyAuth, getUserProfile);
router.put("/profile", verifyAuth, upload.single("avatar"), updateUserProfile);
router.put("/password", verifyAuth, changePassword);
router.get("/memories", verifyAuth, getUserMemories);

export default router;