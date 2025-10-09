import Memory from "../../models/Memory.js";

export const isCollaborator = async (req, res, next) => {
  try {
    const memoryId = req.params.memoryId || req.body.memoryId;
    const memory = await Memory.findById(memoryId);
    if (!memory) return res.status(404).json({ message: "Memory not found" });

    const userId = req.user._id.toString();
    const allowed =
      memory.author.toString() === userId ||
      memory.collaborators.some((id) => id.toString() === userId);

    if (!allowed)
      return res.status(403).json({ message: "You are not allowed to edit this memory" });

    req.memory = memory;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking collaborator access" });
  }
};
