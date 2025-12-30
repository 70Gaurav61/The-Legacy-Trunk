import MemoryVersion from "../models/MemoryVersion.js";

// 🟢 Get all versions for a specific memory
export const getMemoryVersions = async (req, res) => {
  try {
    const memoryId = req.params.memoryId || (req.memory && req.memory._id);
    if (!memoryId) return res.status(400).json({ message: "Memory ID required" });

    const versions = await MemoryVersion.find({ memory: memoryId })
      .populate("editor", "username avatarUrl") // 🔴 FIX: Populate 'editor', not 'editedBy'
      .sort({ createdAt: -1 });

    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};