import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema({
  family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  name: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ["male", "female", "other"] },
  
  // Link to the User Account (if they have signed up)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Tree Structure (Child points to Parent)
  relationTo: { type: mongoose.Schema.Types.ObjectId, ref: "Person" }, 
  relationType: { 
    type: String, 
    // ✅ FIXED: "Admin" removed. "Spouse" split into specific roles for clearer logic.
    enum: ["father", "mother", "son", "daughter","spouse", "wife", "husband", "brother", "sister", "other"], 
    default: "other" 
  },
  
  generation: { type: Number, index: true },
  avatarUrl: String,
  bio: String,

  // ✅ ADDED: Essential for the 'Invite/Claim' feature
  claimCode: { type: String, select: false }, // Hidden by default for security
  isClaimed: { type: Boolean, default: false }

  // ❌ REMOVED: children: [] (Calculated dynamically via aggregation in controller)
}, { timestamps: true });


// 🧠 Auto-calculate generation
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