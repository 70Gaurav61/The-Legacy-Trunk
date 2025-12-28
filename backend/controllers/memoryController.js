import Memory from "../models/Memory.js";
import User from "../models/User.js";
import Person from "../models/Person.js"; // Import Person model
// Create Memory
// In memoryController.js -> createMemory

export const createMemory = async (req, res) => {
  try {
    const memoryData = {
      ...req.body,
      author: req.user._id,
      family: req.params.familyId, // 🟢 Matches route parameter
      date: req.body.date || new Date(),
    };

    // 🟢 FIX: Handle Array of Files (because route uses upload.array)
    if (req.files && req.files.length > 0) {
      memoryData.media = req.files.map(file => ({
        url: file.location, // Assuming S3/Multer-S3
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    const memory = await Memory.create(memoryData);
    res.status(201).json(memory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all memories in a family
// export const getMemories = async (req, res) => {
//   try {
//     const memories = await Memory.find({ family: req.family._id });
//     res.json(memories);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// REPLACE your existing getMemories in memoryController.js with this:

export const getMemories = async (req, res) => {
  try {
    const { userId, visibility } = req.query;
    const familyId = req.params.familyId; 

    // 1. Base Query: Always filter by the current Family
    let query = { family: familyId };

    // ==================================================
    // CASE A: PRIVATE GALLERY REQUEST
    // ==================================================
    if (visibility === 'private') {
      // Security: ONLY show private memories if the author is the requester.
      query.author = req.user._id; 
      query.visibility = 'private';
    } 
    
    // ==================================================
    // CASE B: STANDARD FEED (Specific User Filter)
    // ==================================================
    else if (userId) {
      
      // Step 1: Find the 'Person ID' linked to this User
      // (Because tags are stored as Person IDs, not User IDs)
      const user = await User.findById(userId);
      
      let personId = user?.primaryPerson;
      
      // Fallback: If primaryPerson isn't set, try to find the Person linked to this User
      if (!personId) {
        const linkedPerson = await Person.findOne({ user: userId });
        if (linkedPerson) personId = linkedPerson._id;
      }

      // Step 2: Create the "OR" logic
      // Show memory IF: (User is the Author) OR (User's Person Profile is Tagged)
      if (personId) {
        query.$or = [
          { author: userId },          // Did they upload it?
          { taggedPersons: personId }  // Are they tagged in it?
        ];
      } else {
        // If we can't find their Person Profile, just show what they uploaded
        query.author = userId;
      }

      // Optional Security: Don't show this user's PRIVATE memories to others
      if (userId !== req.user._id.toString()) {
         query.visibility = { $ne: 'private' };
      }
    }
    
    // ==================================================
    // CASE C: MAIN FEED (All Family Memories)
    // ==================================================
    else {
      // In the main feed, we generally hide other people's private notes
      // Show: (Public/Family/Selected) OR (My Private Memories)
      query.$or = [
        { visibility: { $ne: 'private' } },
        { author: req.user._id }
      ];
    }

    // 3. Execute Query with Populate
    const memories = await Memory.find(query)
      .populate("author", "username avatarUrl") // Show Uploader Name
      .populate("taggedPersons", "name")        // Show names of tagged people
      .sort({ date: -1 });

    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update Memory (Collaborator)
export const updateMemory = async (req, res) => {
  try {
    Object.assign(req.memory, req.body);
    await req.memory.save();
    res.json(req.memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Memory
export const deleteMemory = async (req, res) => {
  try {
    await req.memory.remove();
    res.json({ message: "Memory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
