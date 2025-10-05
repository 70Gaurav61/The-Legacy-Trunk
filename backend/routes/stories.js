import express from "express";
import { protect } from "../middlewares/auth.js";
import { createStory, listStories } from "../controllers/storyController.js";

const router = express.Router();

router.route("/").post(protect, createStory).get(protect, listStories);

export default router;
