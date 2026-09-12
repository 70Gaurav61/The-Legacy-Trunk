import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const FileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  mimeType: String,
  size: Number,
  originalName: String,
  uploadedAt: { type: Date, default: Date.now }
});

const SecureVaultSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    vaultName: {
      type: String,
      default: "My Personal Vault"
    },

    password: {
      type: String,
      required: true
    },

    files: [FileSchema],

    lastUnlockedAt: Date
  },
  { timestamps: true }
);

SecureVaultSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

SecureVaultSchema.methods.verifyPassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

export default mongoose.model("SecureVault", SecureVaultSchema);
