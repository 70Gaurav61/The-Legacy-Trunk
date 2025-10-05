import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  filename: String,
  url: { type: String, required: true },
  mimeType: String,
  size: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Media = mongoose.model("Media", mediaSchema);
export default Media;
