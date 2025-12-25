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
} from "../controllers/personController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";

const router = express.Router();

// ==========================================
// 🟢 1. STATIC ROUTES (Must be first)
// ==========================================

// Tree Visualizations
router.get("/tree/descendants", verifyAuth, isFamilyMember, getDescendants);
router.get("/tree/ancestors", verifyAuth, isFamilyMember, getAncestors); // Auto-detects self
router.get("/tree/ancestors/:personId", verifyAuth, isFamilyMember, getAncestors); // Specific person
router.get("/tree/whole", verifyAuth, isFamilyMember, getFullTree);

// Standard List (Flat)
router.get("/", verifyAuth, isFamilyMember, getPersons);

// Add Person
router.post("/", verifyAuth, isFamilyMember, addPerson);

// ==========================================
// 🟢 2. DYNAMIC ID ROUTES (Must be last)
// ==========================================

// Invite Route (Specific logic for a person ID)
router.post("/:personId/invite", verifyAuth, isFamilyMember, generateClaimCode);

// Update/Delete (Catch-all for IDs)
router.put("/:personId", verifyAuth, isFamilyMember, updatePerson);
router.delete("/:personId", verifyAuth, isFamilyMember, deletePerson);

export default router;