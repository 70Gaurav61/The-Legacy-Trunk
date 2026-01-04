import Memory from "../../models/Memory.js";
import Person from "../../models/Person.js"; // 🟢 1. Import Person Model

export const isCollaborator = async (req, res, next) => {
  try {
    const memoryId = req.params.memoryId || req.body.memoryId;
    
    // Find memory
    const memory = await Memory.findById(memoryId);
    if (!memory) return res.status(404).json({ message: "Memory not found" });

    const userId = req.user._id.toString();

    // 🟢 CHECK 1: Is Author?
    if (memory.author.toString() === userId) {
      req.memory = memory;
      return next();
    }

    // 🟢 CHECK 2: Is Explicit Collaborator?
    if (memory.collaborators && memory.collaborators.some((id) => id.toString() === userId)) {
      req.memory = memory;
      return next();
    }

    // 🟢 CHECK 3: Is Tagged Person? (This fixes your 403 Error)
    // We check if the current User is linked to any of the Person IDs in the tagged list
    if (memory.taggedPersons && memory.taggedPersons.length > 0) {
      const taggedPerson = await Person.findOne({
        user: userId, // The logged-in user
        _id: { $in: memory.taggedPersons } // Is in the tagged list
      });

      if (taggedPerson) {
        req.memory = memory;
        return next(); // Allow access!
      }
    }

    // If all checks fail:
    return res.status(403).json({ message: "You are not allowed to edit this memory" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking collaborator access" });
  }
};