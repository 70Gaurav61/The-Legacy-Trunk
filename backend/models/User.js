import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatarUrl: String,
  primaryPerson: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  persons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
  families: [{ type: mongoose.Schema.Types.ObjectId, ref: "Family" }],
  role: {
    type: String,
    enum: ["member", "creator", "admin"],
    default: "member"
  }
}, { timestamps: true });

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
