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

    // Just fetch the data. Do NOT update 'delivered' status here.
    // The memoryController.js (Feed) will handle the unlocking.
    const messages = await ScheduledMessage.find({
      family: req.family._id,
      $or: [
        { delivered: true },           // Already opened (and converted to memory)
        { author: currentUserId }      // My pending capsules
      ]
    }).sort({ deliverAt: 1 });

    res.json(messages);
  } catch (err) {
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

    // Only Author can delete
    if (message.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await message.deleteOne();
    res.json({ message: "Time capsule destroyed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};