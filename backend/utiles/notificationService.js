// services/notificationService.js
import Notification from "../models/Notification.js";

export const createNotification = async ({ recipient, sender, type, payload }) => {
  try {
    // 🟢 FIX: Allow self-notifications for System Events ('on_this_day', 'birthday_alert')
    // For other types (like likes/tags), keep blocking self-notifications.
    const isSystemAlert = type === 'on_this_day' || type === 'birthday_alert';
    
    if (!isSystemAlert && recipient.toString() === sender.toString()) {
      return; 
    }

    await Notification.create({
      user: recipient, 
      type: type,
      payload: {
        ...payload,
        sender: sender 
      },
      read: false
    });
    
  } catch (err) {
    console.error("Notification Error:", err.message);
  }
};