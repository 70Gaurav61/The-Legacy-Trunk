import express from "express";
import {
  createVault,
  getVault,
  unlockVault,
  uploadVaultFile
} from "../controllers/vaultController.js";

import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { uploadVault } from "../middlewares/files/uploadMiddleware.js";

const router = express.Router();

router.post("/create", verifyAuth, createVault);
router.get("/", verifyAuth, getVault);
router.post("/unlock", verifyAuth, unlockVault);
router.post("/upload", verifyAuth, uploadVault.single("file"), uploadVaultFile);

export default router;
