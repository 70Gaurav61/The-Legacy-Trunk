import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send token as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only true in production (HTTPS)
      sameSite: "None", // allow frontend (React) from another domain
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ user, message: "Registration successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set JWT as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None", // Important for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.json({ message: "Logged out successfully" });
};

// Me (authenticated user)
export const me = async (req, res) => {
  res.json({ user: req.user });
};
