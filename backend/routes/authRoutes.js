import express from "express";
import { register, login, me, logout,checkUsername } from "../controllers/authController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";

const router = express.Router();


router.get("/check-username", checkUsername);
router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyAuth, me);
router.post("/logout",logout)

export default router;
