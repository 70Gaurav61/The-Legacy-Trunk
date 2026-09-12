import User from "../models/User.js";
import Person from "../models/Person.js";
import Memory from "../models/Memory.js";


export const getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("primaryPerson")
      .populate("families", "name creator");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const { username, bio, gender, dob } = req.body;
    const userId = req.user._id;

    const avatarUrl = req.file ? req.file.path : undefined;

    // 1. Prepare User Updates
    const userUpdates = { username };
    if (avatarUrl) userUpdates.avatarUrl = avatarUrl;

    // 2. Update User Model
    const user = await User.findByIdAndUpdate(userId, userUpdates, { new: true });

    // 3. Update Linked Person Model (to keep Tree in sync)
    if (user.primaryPerson) {
      const personUpdates = { name: username, bio, gender, dob };
      if (avatarUrl) personUpdates.avatarUrl = avatarUrl;

      await Person.findByIdAndUpdate(user.primaryPerson, personUpdates);
    }

    // 4. Return Updated Data
    const updatedUser = await User.findById(userId)
      .populate("primaryPerson")
      .populate("families", "name creator");

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    user.password = newPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getUserMemories = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const personId = user.primaryPerson;

    const myUploads = await Memory.find({ author: userId })
      .sort({ date: -1 })
      .populate("author", "username avatarUrl");

    let taggedIn = [];
    if (personId) {
      taggedIn = await Memory.find({
        taggedPersons: personId,
        author: { $ne: userId }
      })
        .sort({ date: -1 })
        .populate("author", "username avatarUrl");
    }

    res.json({ myUploads, taggedIn });
  } catch (err) {
    console.error("Get Memories Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// 🟢 GET ANOTHER USER'S PUBLIC PROFILE
// ==========================================
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate("primaryPerson")
      .populate("families", "name creator");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove sensitive fields before returning
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.__v;

    res.json(safeUser);
  } catch (err) {
    console.error("Get User By Id Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// 🟢 GET MEMORIES FOR A SPECIFIC USER
// ==========================================
export const getUserMemoriesById = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const myUploads = await Memory.find({ author: targetUserId })
      .sort({ date: -1 })
      .populate("author", "username avatarUrl");

    // We cannot reliably determine Person id for another user here without exposing internals,
    // so 'taggedIn' will be empty for other users (frontend does not depend on it strongly).
    const taggedIn = [];

    res.json({ myUploads, taggedIn });
  } catch (err) {
    console.error("Get User Memories By Id Error:", err);
    res.status(500).json({ message: err.message });
  }
};