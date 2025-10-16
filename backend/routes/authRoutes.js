import express from "express";
import { register, login, me, logout } from "../controllers/authController.js";
import { verifyAuth } from "../middlewares/auth/verifyAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyAuth, me);
router.post("/logout",logout)

export default router;
