import express from "express";
import {
  addPerson,
  getPersons,
  updatePerson,
  deletePerson,
  getDescendants,
  getAncestors,
  getFullTree,
  generateClaimCode,
  getManagedPersons, 
  getPersonProfile
} from "../controllers/personController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";

const router = express.Router();

router.get("/managed", verifyAuth, getManagedPersons);
router.get("/tree/descendants", verifyAuth, getDescendants);
router.get("/tree/ancestors", verifyAuth, getAncestors);
router.get("/tree/whole", verifyAuth, getFullTree);

router.get("/", verifyAuth, isFamilyMember, getPersons);

router.post("/", verifyAuth, isFamilyMember, addPerson);
router.get("/:familyId", verifyAuth, getPersons);


// Invite Route
router.post("/:personId/invite", verifyAuth, isFamilyMember, generateClaimCode);

// Specific Ancestor 
router.get("/tree/ancestors/:personId", verifyAuth, isFamilyMember, getAncestors);

// Update/Delete
router.put("/:personId", verifyAuth, isFamilyMember, updatePerson);
router.delete("/:personId", verifyAuth, isFamilyMember, deletePerson);

// Public view for person entries (profile + tagged memories)
router.get("/profile/:personId", verifyAuth, getPersonProfile);

export default router;