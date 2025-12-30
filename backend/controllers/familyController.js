import Family from "../models/Family.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
// 🟢 Import Notification Service
import { createNotification } from "../utiles/notificationService.js"; 

// 🟢 Create Family (No changes needed, but good to keep structure)
export const createFamily = async (req, res) => {
  try {
    const { name, password } = req.body;
    
    const family = await Family.create({
      name,
      password,
      creator: req.user._id,
      members: [req.user._id],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { families: family._id }
    });

    res.status(201).json(family);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🟢 Join Family (UPDATED WITH NOTIFICATION)
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
    await Family.findByIdAndUpdate(family._id, {
      $addToSet: { members: req.user._id }
    });

    // 4. Add Family to User's list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { families: family._id }
    });

    // ========================================================
    // 🔔 NOTIFICATION LOGIC: USER JOINED VIA CODE
    // ========================================================
    // 'family.members' currently holds the list of members BEFORE this user joined.
    // This is perfect because we want to notify THEM, not the new user.
    
    for (const memberId of family.members) {
      // Safety check: ensure we don't notify the user themselves (if they rejoined)
      if (memberId.toString() !== req.user._id.toString()) {
        
        await createNotification({
          recipient: memberId,
          sender: req.user._id,
          type: 'new_member', // Reuse the same type as the Claim logic
          payload: {
            // We link to the Family ID since they might not have a Person Profile yet
            familyId: family._id, 
            message: `${req.user.username} joined the family! Say hello. 👋`
          }
        });
        
      }
    }
    // ========================================================

    res.json({ message: "Joined family successfully", family });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Get Family Members (No changes)
export const getMembers = async (req, res) => {
  try {
    if (!req.family) {
      return res.status(400).json({ message: "Family context missing" });
    }

    await req.family.populate({
      path: "members",
      select: "username email avatarUrl primaryPerson", 
      populate: {
        path: "primaryPerson",
        select: "name avatarUrl relationType" 
      }
    });

    res.json(req.family.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Update Family Password
export const updateFamilyPassword = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { newPassword } = req.body;

    const family = await Family.findById(familyId);
    if (!family) return res.status(404).json({ message: "Family not found" });

    // Check if user is the creator (or add an 'admins' array logic)
    if (family.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the family creator can change the password" });
    }

    // Hash new password (if your Family model has a pre-save hook like User)
    // If not, hash it manually here: const hash = await bcrypt.hash(newPassword, 10);
    family.password = newPassword; // Triggers pre-save hook if exists
    await family.save();

    res.json({ message: "Family password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};