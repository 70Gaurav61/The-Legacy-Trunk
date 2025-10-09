import express from "express";
import { createFamily, joinFamily, getMembers } from "../controllers/familyController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";

const router = express.Router();

router.post("/", verifyAuth, createFamily);
router.post("/join", verifyAuth, joinFamily);
router.get("/:familyId/members", verifyAuth, isFamilyMember, getMembers);

export default router;
