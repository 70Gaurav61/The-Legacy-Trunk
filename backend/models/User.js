import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

// hash before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
