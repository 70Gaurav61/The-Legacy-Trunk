import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Remove sensitive fields before sending user to client
const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

// Cookie options (reuse in register/login)
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Register (signup)
export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "username, email, password and confirmPassword are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if username or email already exists
    const existing = await User.findOne({
      $or: [{ username }, { email: normalizedEmail }]
    });

    if (existing) {
      if (existing.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
      if (existing.email === normalizedEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      // fallback
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user — password hashing handled by UserSchema.pre("save")
    const user = await User.create({
      username,
      email: normalizedEmail,
      password
    });

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie("token", token, cookieOptions());

    res.status(201).json({
      user: sanitizeUser(user),
      message: "Registration successful"
    });
  } catch (err) {
    // Duplicate key error (just in case index exists)
    if (err.code === 11000) {
      const key = Object.keys(err.keyValue || {})[0];
      return res.status(400).json({ message: `${key} already exists` });
    }
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Login (by username OR email)
export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return res.status(400).json({ message: "Provide password and (username or email)" });
    }

    // Build query dynamically to avoid calling toLowerCase on undefined
    const query = username
      ? { username }
      : { email: (email || "").toLowerCase() };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie("token", token, cookieOptions());

    res.json({ user: sanitizeUser(user), message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
  });
  res.json({ message: "Logged out successfully" });
};


// GET /api/v1/auth/check-username?username=theName
export const checkUsername = async (req, res) => {
  try {
    const username = (req.query.username || "").trim();
    if (!username) return res.status(400).json({ message: "username required" });

    const exists = await User.findOne({ username });
    return res.json({ available: !Boolean(exists) });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};


// Me - return authenticated user (requires auth middleware to set req.user)
export const me = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ user: sanitizeUser(req.user) });
};
