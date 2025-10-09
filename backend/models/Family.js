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
export default mongoose.model("Family", FamilySchema);
