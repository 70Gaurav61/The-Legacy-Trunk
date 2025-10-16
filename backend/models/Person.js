import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema({
  family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  name: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ["male","female","other"] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  relationTo: { type: mongoose.Schema.Types.ObjectId, ref: "Person" }, // parent
  relationType: { type: String, enum: ["father","mother","son","daughter","spouse","sibling","grandfather","grandmother","other", "Admin"], default: "other" },
  generation: { type: Number, index: true }, // computed on create/update
  avatarUrl: String,
  bio: String
}, { timestamps: true });


// Auto-calculate generation
PersonSchema.pre("save", async function (next) {
  if (!this.isModified("relationTo")) return next();
  if (!this.relationTo) {
    this.generation = 1;
    return next();
  }

  try {
    const parent = await this.model("Person").findById(this.relationTo);
    if (parent) {
      if (["father", "mother", "grandfather", "grandmother"].includes(this.relationType)) {
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
