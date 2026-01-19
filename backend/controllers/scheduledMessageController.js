import ScheduledMessage from "../models/ScheduledMessage.js";

// ========================================================
// 🟢 SCHEDULE MESSAGE (Standard Create)
// ========================================================
export const scheduleMessage = async (req, res) => {
  try {
    const { content, deliverAt } = req.body;

    // Validate Date
    const deliveryDate = new Date(deliverAt);
    if (deliveryDate <= new Date()) {
        return res.status(400).json({ message: "Delivery date must be in the future." });
    }

    // Handle Attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        url: file.location,
        mimeType: file.mimetype
      }));
    }

    const message = await ScheduledMessage.create({
      family: req.family._id,
      author: req.user._id,
      content,
      deliverAt: deliveryDate,
      attachments,
      delivered: false
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================================================
// 🟢 GET MESSAGES (Clean Read - No Auto-Unlock)
// ========================================================
export const getScheduledMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const messages = await ScheduledMessage.find({
      family: req.family._id, // Assumes isFamilyMember middleware sets req.family
      $or: [
        { delivered: true },           // Everyone sees opened capsules
        { author: currentUserId }      // Only I see my pending capsules
      ]
    })
    .populate('memoryId', '_id') // 🟢 CRITICAL: Checks if the linked memory still exists
    .sort({ delivered: 1, createdAt: -1 }); // 🟢 SORT: Pending first, then Newest first

    res.json(messages);
  } catch (err) {
    console.error("Fetch Capsules Error:", err);
    res.status(500).json({ message: err.message });
  }
};
// ========================================================
// 🟢 DELETE MESSAGE
// ========================================================
export const deleteScheduledMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ScheduledMessage.findById(id);

    if (!message) return res.status(404).json({ message: "Capsule not found" });

    // Security Check: Only the author can delete
    if (message.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await message.deleteOne();
    res.json({ message: "Time capsule destroyed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};