import User from "../models/User.js";
import Person from "../models/Person.js";
import Memory from "../models/Memory.js";

// ==========================================
// 🟢 GET PROFILE (User + Linked Person Info)
// ==========================================
export const getUserProfile = async (req, res) => {
  try {
    // 1. Find the logged-in user
    // We populate 'primaryPerson' to get the bio/gender/dob from the tree
    // 🟢 CRITICAL: We populate 'creator' in families so frontend knows if user is Admin
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

// ==========================================
// 🟢 UPDATE PROFILE (Info + Avatar)
// ==========================================
export const updateUserProfile = async (req, res) => {
  try {
    const { username, bio, gender, dob } = req.body;
    const userId = req.user._id;
    
    // Check if a file was uploaded (handled by Multer middleware)
    // Cloudinary usually returns 'path' or 'secure_url'
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
    // 🟢 CRITICAL: Populate 'creator' again so the UI doesn't break after saving
    const updatedUser = await User.findById(userId)
      .populate("primaryPerson")
      .populate("families", "name creator");

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// 🟢 CHANGE PASSWORD
// ==========================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // We need to explicitly select password because it is hidden by default
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    user.password = newPassword; 
    // Saving triggers the 'pre-save' hook in your User model to hash the new password
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// 🟢 GET USER MEMORIES (My Uploads vs Tagged)
// ==========================================
export const getUserMemories = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // We need the Person ID to check tags. 
    // If user hasn't claimed a profile yet, this might be null.
    const user = await User.findById(userId);
    const personId = user.primaryPerson; 

    // A. Memories I Uploaded
    const myUploads = await Memory.find({ author: userId })
      .sort({ date: -1 })
      .populate("author", "username avatarUrl");

    // B. Memories I am Tagged In
    let taggedIn = [];
    if (personId) {
      taggedIn = await Memory.find({ 
        taggedPersons: personId, 
        author: { $ne: userId } // Exclude ones I uploaded myself
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