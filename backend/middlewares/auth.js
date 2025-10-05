import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer"))
    token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  next();
};
