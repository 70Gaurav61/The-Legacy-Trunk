import express from "express";
import { getUserProfile, updateUserProfile, changePassword, getUserMemories } from "../controllers/userController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { upload } from "../middlewares/files/uploadMiddleware.js"; // Your Multer setup

const router = express.Router();

router.get("/profile", verifyAuth, getUserProfile);
// 🟢 Add 'upload.single("avatar")' middleware
router.put("/profile", verifyAuth, upload.single("avatar"), updateUserProfile);
router.put("/password", verifyAuth, changePassword);
router.get("/memories", verifyAuth, getUserMemories); // Fetch user-specific stories

export default router;