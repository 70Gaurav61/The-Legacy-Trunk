import StorageItem from "../models/StorageItem.js";

// Upload File
export const uploadStorageItem = async (req, res) => {
  try {
    const { title, description, password, tags } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "File missing" });

    const storageItem = await StorageItem.create({
      owner: req.user._id,
      title,
      description,
      password,
      tags: tags?.split(",") || [],
      file: {
        url: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    res.status(201).json(storageItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user storage items
export const getStorageItems = async (req, res) => {
  try {
    const items = await StorageItem.find({ owner: req.user._id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
