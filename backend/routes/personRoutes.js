import express from "express";
import { addPerson, getPersons, updatePerson, deletePerson } from "../controllers/personController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";
import { isFamilyMember } from "../middlewares/access/isFamilyMember.js";

const router = express.Router();

router.post("/", verifyAuth, isFamilyMember, addPerson);
router.get("/", verifyAuth, isFamilyMember, getPersons);
router.put("/:personId", verifyAuth, updatePerson);
router.delete("/:personId", verifyAuth, deletePerson);

export default router;
