import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Person from "../models/Person.js";
import Family from "../models/Family.js"; // 🟢 IMPORT ADDED

const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// 🟢 1. Standard Register
export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ $or: [{ username }, { email: normalizedEmail }] });
    if (existing) return res.status(400).json({ message: "User or Email already exists" });

    const user = await User.create({ username, email: normalizedEmail, password });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions());

    res.status(201).json({ user: sanitizeUser(user), message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 2. Register via Claim Code (FIXED & COMPLETE)
export const registerAndClaim = async (req, res) => {
  const { username, email, password, claimCode } = req.body;

  try {
    // Check duplicates
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    // 1. Find & Validate Person
    const person = await Person.findOne({ claimCode }).select("+claimCode");
    
    if (!person) return res.status(404).json({ message: "Invalid claim code" });
    if (person.isClaimed) return res.status(400).json({ message: "Profile already claimed" });
    
    // Check for Family Link
    if (!person.family) {
        return res.status(500).json({ message: "Error: This profile is not linked to any family tree." });
    }

    // 2. Create the User
    const user = await User.create({ username, email, password });
    
    // 3. Link Person & Family to User
    user.primaryPerson = person._id;
    user.persons = [person._id]; 
    user.families = [person.family]; 

    // 🟢 4. CRITICAL FIX: Add User to the Family's 'members' list
    // This ensures middleware like 'isFamilyMember' works correctly.
    await Family.findByIdAndUpdate(person.family, {
        $addToSet: { members: user._id } 
    });
    
    // 5. Update Person status
    person.user = user._id;
    person.isClaimed = true;
    person.claimCode = undefined; 

    // 6. Save User & Person
    await user.save();
    await person.save();

    // 7. Generate Token & Respond
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions());

    res.status(201).json({ user: sanitizeUser(user), message: "Profile claimed! Welcome to the family." });
  } catch (err) {
    console.error("Claim Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const query = username ? { username } : { email: (email || "").toLowerCase() };

    const user = await User.findOne(query);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions());

    res.json({ user: sanitizeUser(user), message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });
  res.json({ message: "Logged out" });
};

export const me = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ user: sanitizeUser(req.user) });
};

export const checkUsername = async (req, res) => {
  try {
    const exists = await User.findOne({ username: req.query.username });
    res.json({ available: !exists });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};