import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const StorageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  file: { url: String, mimeType: String, size: Number },
  password: { type: String, required: true }, // hashed with bcrypt
  tags: [String],
  createdAt: Date
}, { timestamps: true });

// Hash password before save
StorageSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("StorageItem", StorageSchema);
