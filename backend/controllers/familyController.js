import Family from "../models/Family.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// 🟢 Create Family
export const createFamily = async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Create the family document
    const family = await Family.create({
      name,
      password,
      creator: req.user._id,
      members: [req.user._id],
    });

    // Add this family ID to the User's list
    // (Using $addToSet ensures no duplicates, though unnecessary here on create)
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { families: family._id }
    });

    res.status(201).json(family);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🟢 Join Family (Step 2 of Workflow)
export const joinFamily = async (req, res) => {
  try {
    const { familyCode, password } = req.body;
    
    // 1. Find Family by unique code
    const family = await Family.findOne({ familyCode });
    if (!family) return res.status(404).json({ message: "Family not found" });

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, family.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // 3. Add User to Family Members (if not already there)
    // We use $addToSet which handles the "includes" check natively in MongoDB
    await Family.findByIdAndUpdate(family._id, {
      $addToSet: { members: req.user._id }
    });

    // 4. Add Family to User's list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { families: family._id }
    });

    res.json({ message: "Joined family successfully", family });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Get Family Members
export const getMembers = async (req, res) => {
  try {
    // We assume 'req.family' is set by middleware (e.g., checkFamilyAccess)
    if (!req.family) {
      return res.status(400).json({ message: "Family context missing" });
    }

    // Populate members AND their linked Person profile (primaryPerson)
    // This lets the frontend show "Arthur Weasley" instead of just "user_arthur"
    await req.family.populate({
      path: "members",
      select: "username email avatarUrl primaryPerson", // Select specific user fields
      populate: {
        path: "primaryPerson",
        select: "name avatarUrl relationType" // Get the real name from the Person model
      }
    });

    res.json(req.family.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};