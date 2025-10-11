import express from "express";
import { createMemory, getMemories, updateMemory, deleteMemory } from "../controllers/memoryController.js";
import { addMemoryVersion, getMemoryVersions } from "../controllers/memoryVersionController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";
import { isCollaborator } from "../middlewares/access/isCollaborator.js";
import { upload } from "../middlewares/files/uploadMiddleware.js";

const router = express.Router();

// Memory CRUD
router.post("/:familyId", verifyAuth, isFamilyMember, upload.array("media", 5), createMemory);
router.get("/:familyId", verifyAuth, isFamilyMember, getMemories);
router.put("/:memoryId", verifyAuth, isCollaborator, updateMemory);
router.delete("/:memoryId", verifyAuth, isCollaborator, deleteMemory);

// Memory Versions
router.post("/:memoryId/versions", verifyAuth, isCollaborator, addMemoryVersion);
router.get("/:memoryId/versions", verifyAuth, isCollaborator, getMemoryVersions);

export default router;
