const StorageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  file: { url: String, mimeType: String, size: Number },
  password: { type: String, required: true }, // hashed with bcrypt
  tags: [String],
  createdAt: Date
}, { timestamps: true });
export default mongoose.model("StorageItem", StorageSchema);
