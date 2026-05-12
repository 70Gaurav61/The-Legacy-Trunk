import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const FileSchema = new mongoose.Schema({
  url: { type: String, required: true }, // S3 URL
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
      unique: true // one vault per user
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

/* Hash vault password */
SecureVaultSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* Verify vault password */
SecureVaultSchema.methods.verifyPassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

export default mongoose.model("SecureVault", SecureVaultSchema);
