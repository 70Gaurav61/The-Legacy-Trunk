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

    // 3. Trigger Notifications (Async - don't block response)
    // We pass the memory and user to a helper logic block below or keep it here
    // For clarity/speed, I kept the logic here but cleaner
    sendMemoryNotifications(req, memory, req.family._id);

    res.status(201).json(memory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ========================================================
// 🟢 READ MEMORIES (Feed/Search)
// Logic remains mostly same as it handles complex filtering
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
      // Find Person ID logic...
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

      // Combine with existing Search Query ($and)
      if (query.$or) {
        query = { $and: [query, userFilter] };
      } else {
        Object.assign(query, userFilter);
      }
      
      // Hide private items if viewing someone else
      if (userId !== req.user._id.toString()) {
        query.visibility = { $ne: 'private' };
      }
    } 
    else if (!search) {
      // Default Feed: Public items OR My Private items
      query.$and = [{
        $or: [
          { visibility: { $ne: 'private' } },
          { author: req.user._id }
        ]
      }];
    }

    const memories = await Memory.find(query)
      .populate("author", "username avatarUrl")
      .populate("taggedPersons", "name")
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
      .populate("taggedPersons", "name avatarUrl");

    if (!memory) return res.status(404).json({ message: "Memory not found" });

    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================================================
// 🟢 UPDATE MEMORY
// Optimized: Uses req.memory from 'isCollaborator' middleware
// ========================================================
// backend/controllers/memoryController.js

export const updateMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    
    // 1. Find Old Memory
    const oldMemory = await Memory.findById(memoryId);
    if (!oldMemory) return res.status(404).json({ message: "Memory not found" });

    // 2. Permission Check
    if (oldMemory.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this." });
    }

    // 3. 📸 CREATE SNAPSHOT
    await MemoryVersion.create({
      memory: oldMemory._id,
      
      // 🔴 FIX HERE: Change 'editedBy' to 'editor' to match your Schema
      editor: req.user._id, 
      
      previousTitle: oldMemory.title,
      previousDescription: oldMemory.description,
      previousMedia: oldMemory.media, 
      createdAt: new Date()
    });

    // 4. Apply Updates
    const updatedMemory = await Memory.findByIdAndUpdate(
      memoryId,
      { 
        title: req.body.title,
        description: req.body.description,
        date: req.body.date
      },
      { new: true }
    ).populate("author", "username avatarUrl");

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
    await memory.deleteOne(); // Mongoose document method

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
// Extracted to keep createMemory clean
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