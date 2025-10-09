import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, index: true, required: true },
  password: { type: String, required: true },
  avatarUrl: String,
  primaryPerson: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  persons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
  families: [{ type: mongoose.Schema.Types.ObjectId, ref: "Family" }],
  role: { type: String, enum: ["member","creator","admin"], default: "member" }
}, { timestamps: true });
export default mongoose.model("User", UserSchema);
