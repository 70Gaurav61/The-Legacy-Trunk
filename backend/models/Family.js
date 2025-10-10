import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const FamilySchema = new mongoose.Schema({
  name: { type: String, required: true },
  familyCode: { type: String, unique: true, required: true, index: true },
  password: { type: String, required: true }, // bcrypt hashed
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  settings: {
    defaultVisibility: { type: String, enum: ["family","selected"], default: "family" }
  }
}, { timestamps: true });

// Generate a unique family code if missing
FamilySchema.pre("validate", function (next) {
  if (!this.familyCode) {
    this.familyCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  next();
});

// Hash password
FamilySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Family", FamilySchema);
