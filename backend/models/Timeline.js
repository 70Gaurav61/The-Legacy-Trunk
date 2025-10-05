import mongoose from "mongoose";

const timelineEventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  story: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
});

const timelineSchema = new mongoose.Schema({
  name: { type: String, default: "Default Timeline" },
  events: [timelineEventSchema],
  createdAt: { type: Date, default: Date.now },
});

const Timeline = mongoose.model("Timeline", timelineSchema);
export default Timeline;
