import Memory from "../models/Memory.js";
import User from "../models/User.js";
import Person from "../models/Person.js";
import MemoryVersion from "../models/MemoryVersion.js"; // 🟢 MAKE SURE THIS IS IMPORTED

import { createNotification } from "../utiles/notificationService.js"; // 🟢 Import helper

export const createMemory = async (req, res) => {
  try {
    // 1. Setup Memory Data
    const memoryData = {
      ...req.body,
      author: req.user._id,
      family: req.params.familyId,
      date: req.body.date || new Date(),
    };

    // Handle Files (Media)
    if (req.files && req.files.length > 0) {
      memoryData.media = req.files.map(file => ({
        url: file.location, 
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    // 2. Save to Database
    const memory = await Memory.create(memoryData);

    // ========================================================
    // 🔔 NOTIFICATION LOGIC START
    // ========================================================
    
    // A. HANDLE TAGGED PERSONS (Specific Alert)
    // --------------------------------------------------------
    let taggedUserIds = []; // Keep track so we don't notify them twice

    if (req.body.taggedPersons && req.body.taggedPersons.length > 0) {
      // Find the Person documents to get their linked User IDs
      const taggedPeople = await Person.find({ 
        _id: { $in: req.body.taggedPersons } 
      });

      for (const person of taggedPeople) {
        if (person.user) { // Only notify if linked to a real User
          taggedUserIds.push(person.user.toString()); // Add to tracking list

          await createNotification({
            recipient: person.user,
            sender: req.user._id,
            type: 'memory_tag',
            payload: {
              memoryId: memory._id,
              message: `${req.user.username} tagged you in a memory: "${memory.title || 'Untitled'}"`
            }
          });
        }
      }
    }

    // B. HANDLE FAMILY BROADCAST (General Alert)
    // --------------------------------------------------------
    // Find all users in this family
    const familyMembers = await User.find({ families: req.params.familyId });

    for (const member of familyMembers) {
      const memberId = member._id.toString();

      // Rules for Broadcast:
      // 1. Don't notify the Author (yourself)
      // 2. Don't notify people we ALREADY notified via Tags (optional, but cleaner)
      if (memberId !== req.user._id.toString() && !taggedUserIds.includes(memberId)) {
        
        await createNotification({
          recipient: memberId,
          sender: req.user._id,
          type: 'memory_create',
          payload: {
            memoryId: memory._id,
            message: `${req.user.username} added a new memory to the family album.`
          }
        });

      }
    }
    // ========================================================
    // 🔔 NOTIFICATION LOGIC END
    // ========================================================

    res.status(201).json(memory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getMemories = async (req, res) => {
  try {
    const { userId, visibility, search } = req.query;
    const familyId = req.params.familyId; 

    // Base Query
    let query = { family: familyId };

    // ---------------------------------------------------------
    // 1. HANDLE SEARCH (Global Text Search)
    // ---------------------------------------------------------
    if (search) {
      const searchRegex = new RegExp(search, 'i'); 

      const matchingUsers = await User.find({ username: searchRegex }).select('_id');
      const matchingUserIds = matchingUsers.map(u => u._id);

      const matchingPersons = await Person.find({ name: searchRegex, family: familyId }).select('_id');
      const matchingPersonIds = matchingPersons.map(p => p._id);

      const isDate = !isNaN(Date.parse(search));
      let dateQuery = {};
      if (isDate) {
        const start = new Date(search);
        const end = new Date(search);
        end.setDate(end.getDate() + 1);
        dateQuery = { date: { $gte: start, $lt: end } };
      }

      query.$or = [
        { title: searchRegex },              
        { description: searchRegex },        
        { tags: searchRegex },               
        { author: { $in: matchingUserIds } }, 
        { taggedPersons: { $in: matchingPersonIds } }, 
        ...(isDate ? [dateQuery] : [])       
      ];
    }

    // ---------------------------------------------------------
    // 2. HANDLE FILTERS (User Click / Private / Default)
    // ---------------------------------------------------------
    
    // CASE A: Private Gallery
    if (visibility === 'private') {
      query.author = req.user._id; 
      query.visibility = 'private';
    } 
    
    // CASE B: User Clicked in StoriesRail (🟢 MISSING LOGIC RESTORED HERE)
    else if (userId) {
      // Step 1: Find the 'Person ID' linked to this User
      const user = await User.findById(userId);
      let personId = user?.primaryPerson;
      
      if (!personId) {
        const linkedPerson = await Person.findOne({ user: userId });
        if (linkedPerson) personId = linkedPerson._id;
      }

      // Step 2: Show memories where User is Author OR Tagged
      if (personId) {
        // If we are ALSO searching, we need to use $and to combine the Search $or with this Filter $or
        const userFilter = {
             $or: [
               { author: userId },
               { taggedPersons: personId }
             ]
        };

        if (search) {
            query.$and = [ userFilter ];
        } else {
            query.$or = userFilter.$or;
        }
      } else {
        query.author = userId;
      }
      
      // Optional: Hide private memories of others in this view
      if (userId !== req.user._id.toString()) {
          // If we already have a query.$and (from search), push to it
          const privacyFilter = { visibility: { $ne: 'private' } };
          if(query.$and) {
              query.$and.push(privacyFilter);
          } else {
              query.visibility = { $ne: 'private' };
          }
      }
    } 
    
    // CASE C: Default Feed (No specific user selected)
    else if (!search) {
      // Show (Public/Family) OR (My Private)
      query.$and = [
        {
          $or: [
            { visibility: { $ne: 'private' } },
            { author: req.user._id }
          ]
        }
      ];
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

export const updateMemory = async (req, res) => {
  try {
    Object.assign(req.memory, req.body);
    await req.memory.save();
    res.json(req.memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate("author", "username avatarUrl") // Get author details
      .populate("taggedPersons", "name avatarUrl"); // Get tagged people details

    if (!memory) return res.status(404).json({ message: "Memory not found" });

    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const deleteMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;

    // 1. Find the memory first
    const memory = await Memory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    // 2. Check Permissions (Double check: Only Author can delete)
    // Even if isCollaborator checked this, it's safer to check ownership here for deletion
    if (memory.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this memory." });
    }

    // 3. (Optional) Delete Media Files Logic
    // If you are using Cloudinary, you would delete images here.
    // We will skip this for now to fix the 500 error. 
    // MongoDB will just delete the record, and the image URL will become dead (which is fine for now).

    // 4. Delete the Memory Document
    await Memory.findByIdAndDelete(memoryId);

    // 5. Clean up: Delete the 'Edit History' (Versions) for this memory
    // If you don't import MemoryVersion at the top, this line would cause a 500 crash!
    await MemoryVersion.deleteMany({ memory: memoryId });

    res.json({ message: "Memory deleted successfully" });

  } catch (err) {
    // 🟢 THIS LOG IS CRITICAL
    console.error("❌ Delete Memory Error:", err); 
    res.status(500).json({ message: "Server error during deletion: " + err.message });
  }
};