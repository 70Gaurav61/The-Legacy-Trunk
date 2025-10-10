import Family from "../models/Family.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Create Family
export const createFamily = async (req, res) => {
  try {
    const { name, password } = req.body;
    const family = await Family.create({
      name,
      password,
      creator: req.user._id,
      members: [req.user._id],
    });

    // Add family to user
    req.user.families.push(family._id);
    await req.user.save();

    res.status(201).json(family);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Join Family
export const joinFamily = async (req, res) => {
  try {
    const { familyCode, password } = req.body;
    const family = await Family.findOne({ familyCode });
    if (!family) return res.status(404).json({ message: "Family not found" });

    const isMatch = await bcrypt.compare(password, family.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    if (!family.members.includes(req.user._id)) {
      family.members.push(req.user._id);
      await family.save();
    }

    if (!req.user.families.includes(family._id)) {
      req.user.families.push(family._id);
      await req.user.save();
    }

    res.json(family);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get family members
export const getMembers = async (req, res) => {
  try {
    await req.family.populate("members", "-password");
    res.json(req.family.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
