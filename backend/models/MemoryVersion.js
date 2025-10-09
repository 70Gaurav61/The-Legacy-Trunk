import mongoose from "mongoose";

const MemoryVersionSchema = new mongoose.Schema({
  memory: { type: mongoose.Schema.Types.ObjectId, ref: "Memory", required: true },
  versionNumber: { type: Number, required: true },
  editor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  media: [{ url: String, mimeType: String }],
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

// Auto-increment version number
MemoryVersionSchema.pre("validate", async function (next) {
  if (this.isNew && !this.versionNumber) {
    const lastVersion = await this.model("MemoryVersion")
      .findOne({ memory: this.memory })
      .sort({ versionNumber: -1 });
    this.versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
  }
  next();
});

export default mongoose.model("MemoryVersion", MemoryVersionSchema);
