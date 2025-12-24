import express from "express";
import {
  addPerson,
  getPersons,
  updatePerson,
  deletePerson,
  addChild,
  getCurrentUserTree,
  getWholeFamilyTree,
  getFamilyTree,
} from "../controllers/personController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";

const router = express.Router();

router.post("/", verifyAuth, isFamilyMember, addPerson);
router.get("/", verifyAuth, isFamilyMember, getPersons);
router.put("/:personId", verifyAuth, updatePerson);
router.delete("/:personId", verifyAuth, deletePerson);

// 🆕 Add child to a parent
router.post("/child/:parentId", verifyAuth, isFamilyMember, addChild);

// 🆕 Get family tree starting from current user's primary person
router.get("/tree/current", verifyAuth, isFamilyMember, getCurrentUserTree);

// 🆕 Get whole family tree (all roots)
router.get("/tree/whole", verifyAuth, isFamilyMember, getWholeFamilyTree);

// 🆕 Optional: generic family tree
router.get("/tree", verifyAuth, isFamilyMember, getFamilyTree);

export default router;
