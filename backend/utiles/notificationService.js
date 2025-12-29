import Notification from "../models/Notification.js";

export const createNotification = async ({ recipient, sender, type, payload }) => {
  try {
    // 1. Safety Check: Don't notify yourself
    if (recipient.toString() === sender.toString()) return;

    // 2. Create the Notification
    await Notification.create({
      user: recipient, // 🟢 Maps 'recipient' to your model's 'user' field
      type: type,
      
      // 🟢 Fix for missing 'sender' field in model:
      // We store the sender inside the 'payload' (since payload is Mixed type)
      payload: {
        ...payload,      // Keeps 'memoryId' and 'message'
        sender: sender   // Adds 'sender' ID here
      },
      
      read: false
    });
    
  } catch (err) {
    console.error("Notification Error:", err.message);
  }
};