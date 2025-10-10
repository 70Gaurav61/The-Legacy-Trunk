import mongoose from "mongoose";


const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: String,
  payload: mongoose.Schema.Types.Mixed,
  read: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("Notification", NotificationSchema);
