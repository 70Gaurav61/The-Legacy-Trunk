import mongoose from "mongoose";

const ScheduledSchema = new mongoose.Schema({
  family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deliverAt: { type: Date, required: true },
  content: String,
  attachments: [{ url: String, mimeType: String }],
  delivered: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model("ScheduledMessage", ScheduledSchema);
