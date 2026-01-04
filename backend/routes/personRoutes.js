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
} from "../controllers/personController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";

const router = express.Router();

// ==========================================
// 🟢 1. GENERAL ROUTES (Use verifyAuth only)
// ==========================================
// These fetch data based on the LOGGED-IN USER, so they don't need an ID check.

router.get("/managed", verifyAuth, getManagedPersons);
router.get("/tree/descendants", verifyAuth, getDescendants);
router.get("/tree/ancestors", verifyAuth, getAncestors); 
router.get("/tree/whole", verifyAuth, getFullTree); 

// Standard List (Fetches based on user's family)
router.get("/", verifyAuth, getPersons);

// 2. For Tagging/Join (ID provided) -> hits "/:familyId"



// ==========================================
// 🔒 2. SPECIFIC ID ROUTES (Use isFamilyMember)
// ==========================================
// These access a specific person/family, so we MUST check if the user is allowed.

// Add Person (Checks if you are in the family you are adding to)
router.post("/", verifyAuth, isFamilyMember, addPerson);
router.get("/:familyId", verifyAuth, getPersons);


// Invite Route
router.post("/:personId/invite", verifyAuth, isFamilyMember, generateClaimCode);

// Specific Ancestor 
router.get("/tree/ancestors/:personId", verifyAuth, isFamilyMember, getAncestors);

// Update/Delete
router.put("/:personId", verifyAuth, isFamilyMember, updatePerson);
router.delete("/:personId", verifyAuth, isFamilyMember, deletePerson);

export default router;