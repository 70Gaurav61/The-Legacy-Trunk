import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  circle: { type: mongoose.Schema.Types.ObjectId, ref: "Circle" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const Story = mongoose.model("Story", storySchema);
export default Story;
