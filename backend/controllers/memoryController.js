import Memory from "../models/Memory.js";

// Create Memory
export const createMemory = async (req, res) => {
  try {
    const memoryData = {
      ...req.body,
      author: req.user._id,
      family: req.family._id,
      date: req.body.date || new Date(),
    };
    console.log(req);
    console.log("HII");

    console.log(req.file);

    // Handle single file upload
    if (req.file) {
      memoryData.media = [
        {
          url: req.file.location, // ✅ use req.file.location
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      ];
    }

    const memory = await Memory.create(memoryData);
    res.status(201).json(memory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all memories in a family
export const getMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ family: req.family._id });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Memory (Collaborator)
export const updateMemory = async (req, res) => {
  try {
    Object.assign(req.memory, req.body);
    await req.memory.save();
    res.json(req.memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Memory
export const deleteMemory = async (req, res) => {
  try {
    await req.memory.remove();
    res.json({ message: "Memory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
