import MemoryVersion from "../models/MemoryVersion.js";

// Add a new version
export const addMemoryVersion = async (req, res) => {
  try {
    const version = await MemoryVersion.create({
      ...req.body,
      memory: req.memory._id,
      editor: req.user._id,
    });
    req.memory.versions.push(version._id);
    req.memory.currentVersion = version.versionNumber;
    await req.memory.save();
    res.status(201).json(version);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all versions
export const getMemoryVersions = async (req, res) => {
  try {
    const versions = await MemoryVersion.find({ memory: req.memory._id });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
