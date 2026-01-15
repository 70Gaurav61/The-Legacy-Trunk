import express from "express";
import authRoutes from "./authRoutes.js";
import familyRoutes from "./familyRoutes.js";
import personRoutes from "./personRoutes.js";
import memoryRoutes from "./memoryRoutes.js";
import scheduledMessageRoutes from "./scheduledMessageRoutes.js";
import storageRoutes from "./storageRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import userRoutes from "./userRoutes.js";
import vaultRoutes from "./vaultRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/families", familyRoutes);
router.use("/persons", personRoutes);
router.use("/memories", memoryRoutes);
router.use("/scheduled-messages", scheduledMessageRoutes);
router.use("/storage", storageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/users", userRoutes);
router.use("/vault", vaultRoutes);

export default router;
