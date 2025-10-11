import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js"; // Main router
import { errorHandler } from "./middlewares/error/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// -------------------- Global Middleware -------------------- //

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: "*",
}));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(apiLimiter);

// -------------------- Health Check -------------------- //
app.get("/", (req, res) => {
  res.status(200).json({ message: "Legacy Trunk API is running 🚀" });
});

// -------------------- API Routes -------------------- //
app.use("/api/v1", routes); // All routes are prefixed with /api/v1

// -------------------- 404 Handler -------------------- //
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -------------------- Global Error Handler -------------------- //
app.use(errorHandler); // catch all errors

// -------------------- Start Server -------------------- //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`server running on http://localhost:${PORT}`);
  
});
