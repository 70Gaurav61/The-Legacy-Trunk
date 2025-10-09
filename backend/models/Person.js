const PersonSchema = new mongoose.Schema({
  family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  name: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ["male","female","other"] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  relationTo: { type: mongoose.Schema.Types.ObjectId, ref: "Person" }, // parent
  relationType: { type: String, enum: ["father","mother","son","daughter","spouse","sibling","grandfather","grandmother","other"], default: "other" },
  generation: { type: Number, index: true }, // computed on create/update
  avatarUrl: String,
  bio: String
}, { timestamps: true });
export default mongoose.model("Person", PersonSchema);
