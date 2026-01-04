import Memory from "../models/Memory.js";
import User from "../models/User.js";
import Person from "../models/Person.js";
import MemoryVersion from "../models/MemoryVersion.js"; 
import { createNotification } from "../utiles/notificationService.js";

// ========================================================
// 🟢 CREATE MEMORY
// Optimized: Uses req.family from 'isFamilyMember' middleware
// ========================================================
export const createMemory = async (req, res) => {
  try {
    // 1. Setup Memory Data
    const memoryData = {
      ...req.body,
      author: req.user._id,
      family: req.family._id, // ✅ Optimized: Use middleware data
      date: req.body.date || new Date(),
    };

    // Handle Files (Media)
    if (req.files?.length > 0) {
      memoryData.media = req.files.map(file => ({
        url: file.location, 
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    // 2. Save to Database
    const memory = await Memory.create(memoryData);

    // 3. Trigger Notifications (Async)
    sendMemoryNotifications(req, memory, req.family._id);

    res.status(201).json(memory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ========================================================
// 🟢 READ MEMORIES (Feed/Search)
// ========================================================
export const getMemories = async (req, res) => {
  try {
    const { userId, visibility, search } = req.query;
    const familyId = req.params.familyId; 

    let query = { family: familyId };

    // 1. HANDLE SEARCH
    if (search) {
      const searchRegex = new RegExp(search, 'i'); 
      const [matchingUsers, matchingPersons] = await Promise.all([
        User.find({ username: searchRegex }).select('_id'),
        Person.find({ name: searchRegex, family: familyId }).select('_id')
      ]);

      const isDate = !isNaN(Date.parse(search));
      
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { author: { $in: matchingUsers.map(u => u._id) } },
        { taggedPersons: { $in: matchingPersons.map(p => p._id) } }
      ];

      if (isDate) {
        const start = new Date(search);
        const end = new Date(search);
        end.setDate(end.getDate() + 1);
        query.$or.push({ date: { $gte: start, $lt: end } });
      }
    }

    // 2. HANDLE FILTERS
    if (visibility === 'private') {
      query.author = req.user._id; 
      query.visibility = 'private';
    } 
    else if (userId) {
      let personId;
      const targetUser = await User.findById(userId).select('primaryPerson');
      if (targetUser?.primaryPerson) {
        personId = targetUser.primaryPerson;
      } else {
        const linked = await Person.findOne({ user: userId }).select('_id');
        if (linked) personId = linked._id;
      }

      const userFilter = personId 
        ? { $or: [{ author: userId }, { taggedPersons: personId }] }
        : { author: userId };

      if (query.$or) {
        query = { $and: [query, userFilter] };
      } else {
        Object.assign(query, userFilter);
      }
      
      if (userId !== req.user._id.toString()) {
        query.visibility = { $ne: 'private' };
      }
    } 
    else if (!search) {
      query.$and = [{
        $or: [
          { visibility: { $ne: 'private' } },
          { author: req.user._id }
        ]
      }];
    }

    const memories = await Memory.find(query)
      .populate("author", "username avatarUrl")
      // 🟢 CRITICAL FIX: Add "user" so frontend knows who is tagged
      .populate("taggedPersons", "name user") 
      .sort({ date: -1 });

    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================================================
// 🟢 READ SINGLE MEMORY
// ========================================================
export const getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate("author", "username avatarUrl")
      // 🟢 CRITICAL FIX: Add "user" so frontend knows who is tagged
      .populate("taggedPersons", "name avatarUrl user");

    if (!memory) return res.status(404).json({ message: "Memory not found" });

    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================================================
// 🟢 UPDATE MEMORY (With Notifications)
// ========================================================

export const updateMemory = async (req, res) => {
  try {
    const oldMemory = req.memory; // From middleware

    // 1. Create History Snapshot
    await MemoryVersion.create({
      memory: oldMemory._id,
      editor: req.user._id,
      previousTitle: oldMemory.title,
      previousDescription: oldMemory.description,
      previousMedia: oldMemory.media,
      createdAt: new Date()
    });

    // --------------------------------------------------------
    // 🛡️ TAG PERMISSION LOGIC
    // --------------------------------------------------------
    let finalTaggedPersons = req.body.taggedPersons;

    // If 'taggedPersons' is being updated...
    if (finalTaggedPersons) {
      const isOwner = req.user._id.toString() === oldMemory.author.toString();
      
      if (!isOwner) {
        // NON-OWNER: Can ONLY remove themselves. Cannot add/remove others.
        
        // 1. Find the "Person" ID linked to this User in this Family
        const userPerson = await Person.findOne({ user: req.user._id, family: oldMemory.family });
        
        if (userPerson) {
            const oldTags = oldMemory.taggedPersons.map(id => id.toString());
            const requestedTags = finalTaggedPersons; // IDs sent from frontend

            // Check if they are trying to remove themselves
            const isRemovingSelf = !requestedTags.includes(userPerson._id.toString());
            
            if (isRemovingSelf) {
                // ✅ Allow: Reconstruct list as [Old List] - [Self]
                // This ignores any other sneakily added/removed IDs
                finalTaggedPersons = oldTags.filter(id => id !== userPerson._id.toString());
            } else {
                // ❌ Reject: They aren't removing themselves, so reset to Old List (No changes allowed)
                finalTaggedPersons = oldTags;
            }
        } else {
             // If we can't identify them in the family, they can't change tags
             finalTaggedPersons = oldMemory.taggedPersons;
        }
      }
      // If Owner: finalTaggedPersons remains as req.body.taggedPersons (Full Access)
    }
    // --------------------------------------------------------

    // 2. Update Actual Memory
    const updatedMemory = await Memory.findByIdAndUpdate(
      oldMemory._id,
      { 
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        taggedPersons: finalTaggedPersons // 🟢 Apply the sanitized list
      },
      { new: true }
    )
    .populate("author", "username avatarUrl")
    .populate("taggedPersons", "name user"); // Populate 'user' for frontend logic

    // 3. NOTIFY TAGGED USERS (Logic remains same)
    if (updatedMemory.taggedPersons && updatedMemory.taggedPersons.length > 0) {
      const taggedPeople = await Person.find({ _id: { $in: updatedMemory.taggedPersons } });
      for (const person of taggedPeople) {
        if (person.user && person.user.toString() !== req.user._id.toString()) {
          await createNotification({
            recipient: person.user,
            sender: req.user._id,
            type: 'memory_update', 
            payload: {
              memoryId: updatedMemory._id,
              message: `${req.user.username} updated a memory you are tagged in.`
            }
          });
        }
      }
    }

    res.json(updatedMemory);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};
// ========================================================
// 🟢 DELETE MEMORY
// Optimized: Uses req.memory from 'isCollaborator' middleware
// ========================================================
export const deleteMemory = async (req, res) => {
  try {
    const memory = req.memory; // ✅ Optimized: Data exists

    // 1. Strict Ownership Check
    // Middleware allows collaborators, but only AUTHOR can delete
    if (memory.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the author can delete this memory." });
    }

    // 2. Delete Memory
    await memory.deleteOne(); 

    // 3. Cleanup History
    await MemoryVersion.deleteMany({ memory: memory._id });

    res.json({ message: "Memory deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error during deletion" });
  }
};

// ========================================================
// 🧠 HELPER: Send Notifications
// ========================================================
const sendMemoryNotifications = async (req, memory, familyId) => {
  try {
    let taggedUserIds = [];

    // 1. Notify Tagged Persons
    if (req.body.taggedPersons?.length > 0) {
      const taggedPeople = await Person.find({ _id: { $in: req.body.taggedPersons } });
      for (const person of taggedPeople) {
        if (person.user) {
          taggedUserIds.push(person.user.toString());
          await createNotification({
            recipient: person.user,
            sender: req.user._id,
            type: 'memory_tag',
            payload: {
              memoryId: memory._id,
              message: `${req.user.username} tagged you in "${memory.title || 'a memory'}"`
            }
          });
        }
      }
    }

    // 2. Notify Family (Broadcast)
    const familyMembers = await User.find({ families: familyId });
    for (const member of familyMembers) {
      const memberId = member._id.toString();
      // Skip Self and Skip Tagged users (they already got a specific alert)
      if (memberId !== req.user._id.toString() && !taggedUserIds.includes(memberId)) {
        await createNotification({
          recipient: memberId,
          sender: req.user._id,
          type: 'memory_create',
          payload: {
            memoryId: memory._id,
            message: `${req.user.username} added a new memory.`
          }
        });
      }
    }
  } catch (err) {
    console.error("Notification Error:", err);
  }
};