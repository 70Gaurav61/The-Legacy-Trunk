import ScheduledMessage from "../models/ScheduledMessage.js";

// Schedule a message
export const scheduleMessage = async (req, res) => {
  try {
    const message = await ScheduledMessage.create({
      ...req.body,
      author: req.user._id,
      family: req.family._id,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get scheduled messages for family
export const getScheduledMessages = async (req, res) => {
  try {
    const messages = await ScheduledMessage.find({ family: req.family._id });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
