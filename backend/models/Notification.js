import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: String,
  payload: mongoose.Schema.Types.Mixed,
  
  read: { type: Boolean, default: false },
  
  // 🟢 NEW FIELD: This records EXACTLY when the user clicked the notification
  readAt: { type: Date, default: null } 

}, { timestamps: true });

// ❌ REMOVE the old index on createdAt
// NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// 🟢 ADD THIS NEW INDEX:
// MongoDB will only delete documents where 'readAt' HAS A VALUE.
// If 'readAt' is null (unread), the document stays forever.
// Once 'readAt' is set, it deletes 30 days later.
NotificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days = 604800 seconds

export default mongoose.model("Notification", NotificationSchema);