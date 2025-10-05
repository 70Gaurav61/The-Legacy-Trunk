// server.js
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import storyRoutes from "./routes/stories.js";
import timelineRoutes from "./routes/timelines.js";
import circleRoutes from "./routes/circles.js";
import mediaRoutes from "./routes/media.js";
import taggingRoutes from "./routes/tagging.js";

import errorHandler from "./middlewares/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect database
connectDB();

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/timelines", timelineRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/tagging", taggingRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Legacy Trunk API is running 🚀" });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
