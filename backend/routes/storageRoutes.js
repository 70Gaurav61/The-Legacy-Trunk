import express from "express";
import { uploadStorageItem, getStorageItems } from "../controllers/storageController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { upload } from "../middlewares/files/uploadMiddleware.js";

const router = express.Router();

router.post("/", verifyAuth, upload.single("file"), uploadStorageItem);
router.get("/", verifyAuth, getStorageItems);

export default router;
