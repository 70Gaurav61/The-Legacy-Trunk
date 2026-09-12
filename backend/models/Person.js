import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema({
  family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  name: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ["male", "female", "other"] },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  relationTo: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  relationType: {
    type: String,
    enum: ["father", "mother", "son", "daughter", "spouse", "wife", "husband", "brother", "sister", "other"],
    default: "other"
  },

  generation: { type: Number, index: true },
  avatarUrl: String,
  bio: String,

  claimCode: { type: String, select: false },
  isClaimed: { type: Boolean, default: false }
}, { timestamps: true });


PersonSchema.pre("save", async function (next) {
  if (!this.isModified("relationTo")) return next();
  if (!this.relationTo) {
    this.generation = 1;
    return next();
  }

  try {
    const parent = await this.model("Person").findById(this.relationTo);
    if (parent) {
      if (["father", "mother"].includes(this.relationType)) {
        this.generation = parent.generation - 1;
      } else if (["son", "daughter"].includes(this.relationType)) {
        this.generation = parent.generation + 1;
      } else {
        this.generation = parent.generation;
      }
    } else {
      this.generation = 1;
    }
  } catch (err) {
    this.generation = 1;
  }
  next();
});

export default mongoose.model("Person", PersonSchema);