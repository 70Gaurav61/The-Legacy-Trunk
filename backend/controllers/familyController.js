import Family from "../models/Family.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createNotification } from "../utiles/notificationService.js";

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


export const joinFamily = async (req, res) => {
  try {
    const { familyCode, password } = req.body;

    // Find Family by unique code
    const family = await Family.findOne({ familyCode });
    if (!family) return res.status(404).json({ message: "Family not found" });

    // Verify Password
    const isMatch = await bcrypt.compare(password, family.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Add User to Family Members (if not already there)
    await Family.findByIdAndUpdate(family._id, {
      $addToSet: { members: req.user._id }
    });

    // Add Family to User's list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { families: family._id }
    });


    for (const memberId of family.members) {
      if (memberId.toString() !== req.user._id.toString()) {

        await createNotification({
          recipient: memberId,
          sender: req.user._id,
          type: 'new_member',
          payload: {
            familyId: family._id,
            message: `${req.user.username} joined the family! Say hello. 👋`
          }
        });

      }
    }

    res.json({ message: "Joined family successfully", family });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


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


export const updateFamilyPassword = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { newPassword } = req.body;

    const family = await Family.findById(familyId);
    if (!family) return res.status(404).json({ message: "Family not found" });

    if (family.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the family creator can change the password" });
    }

    family.password = newPassword;
    await family.save();

    res.json({ message: "Family password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};