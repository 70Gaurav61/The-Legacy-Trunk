import express from "express";
import { 
  register, 
  registerAndClaim, // 🟢 Added this import
  login, 
  me, 
  logout, 
  checkUsername 
} from "../controllers/authController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";

const router = express.Router();

// 🟢 Public Routes
router.get("/check-username", checkUsername);
router.post("/register", register);
router.post("/register-claim", registerAndClaim); // 🟢 Added this route for invites
router.post("/login", login);
router.post("/logout", logout);

// 🔒 Protected Routes
router.get("/me", verifyAuth, me);

export default router;