const MemorySchema = new mongoose.Schema({
  family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  media: [{ url: String, mimeType: String, size: Number }],
  mediaType: { type: String, enum: ["photo","video","story"], default: "story" },
  date: Date,
  tags: [String],
  visibility: { type: String, enum: ["family","selected","private"], default: "family" },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // used when visibility === selected
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users allowed to propose edits
  versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "MemoryVersion" }],
  currentVersion: { type: Number, default: 1 },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model("Memory", MemorySchema);
