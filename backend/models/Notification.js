import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: String,
  payload: mongoose.Schema.Types.Mixed,

  read: { type: Boolean, default: false },

  readAt: { type: Date, default: null }

}, { timestamps: true });

NotificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days = 604800 seconds

export default mongoose.model("Notification", NotificationSchema);