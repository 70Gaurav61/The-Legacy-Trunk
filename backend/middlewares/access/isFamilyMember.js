import Family from "../../models/Family.js";

export const isFamilyMember = async (req, res, next) => {
  try {
    const familyId = req.params.familyId || req.body.family;
    if (!familyId) return res.status(400).json({ message: "Family ID missing" });

    const family = await Family.findById(familyId);
    if (!family) return res.status(404).json({ message: "Family not found" });

    const userId = req.user._id.toString();
    const isMember =
      family.members.some((m) => m.toString() === userId) ||
      family.creator.toString() === userId;

    if (!isMember)
      return res.status(403).json({ message: "You are not a member of this family" });

    req.family = family;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Family membership check failed" });
  }
};
