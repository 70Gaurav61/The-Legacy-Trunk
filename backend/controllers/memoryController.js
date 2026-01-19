import Memory from "../models/Memory.js";
import User from "../models/User.js";
import Person from "../models/Person.js";
import ScheduledMessage from "../models/ScheduledMessage.js";
import MemoryVersion from "../models/MemoryVersion.js"; 
import { createNotification } from "../utiles/notificationService.js";

// ========================================================
// 🟢 CREATE MEMORY
// ========================================================
export const createMemory = async (req, res) => {
  try {
    const memoryData = {
      ...req.body,
      author: req.user._id,
      family: req.family._id,
      date: req.body.date || new Date(),
      // Ensure sharedWith is handled if sent
      sharedWith: req.body.sharedWith || [] 
    };

    if (req.files?.length > 0) {
      memoryData.media = req.files.map(file => ({
        url: file.location, 
        mimeType: file.mimetype,
        size: file.size,
      }));
    }

    const memory = await Memory.create(memoryData);
    sendMemoryNotifications(req, memory, req.family._id);

    res.status(201).json(memory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ========================================================
// 🟢 READ MEMORIES (Feed/Search) - With Auto-Publish Capsules
// ========================================================
export const getMemories = async (req, res) => {
  try {
    const { userId, visibility, search } = req.query;
    const familyId = req.params.familyId; 
    const currentUserId = req.user._id;

    // ---------------------------------------------------------
    // ⚡ AUTO-PUBLISH DUE CAPSULES & NOTIFY
    // ---------------------------------------------------------
    // 1. Find capsules that are due (past deliverAt) AND not delivered yet
    const dueCapsules = await ScheduledMessage.find({
       family: familyId,
       delivered: false,
       deliverAt: { $lte: new Date() } 
    }).populate("author", "username"); 

    if (dueCapsules.length > 0) {
       console.log(`🚀 Unearthing ${dueCapsules.length} time capsules...`);
       
       // 2. Prepare Memory Objects
       const newMemories = dueCapsules.map(cap => ({
          family: cap.family,
          author: cap.author._id, 
          title: "⏳ Time Capsule Unlocked", 
          description: cap.content || "A memory from the past...", 
          media: cap.attachments.map(a => ({ 
              url: a.url, 
              mimeType: a.mimeType,
              size: 0 
          })),
          date: new Date(),     
          visibility: 'family', 
          tags: ['Time Capsule']
       }));

       // 3. Insert into DB and Capture the created docs
       const createdMemories = await Memory.insertMany(newMemories);

       // 4. 🟢 UPDATE CAPSULES: Mark Delivered AND Link Memory ID
       // We map 1:1 because createdMemories array order matches dueCapsules array order
       const updates = dueCapsules.map((capsule, index) => {
           return ScheduledMessage.findByIdAndUpdate(capsule._id, {
               $set: { 
                   delivered: true,
                   memoryId: createdMemories[index]._id // 🟢 Critical: Link the memory!
               }
           });
       });
       
       // Execute all updates in parallel
       await Promise.all(updates);

       // 5. 🔔 SEND NOTIFICATIONS
       const familyMembers = await User.find({ families: familyId });

       for (let i = 0; i < createdMemories.length; i++) {
          const memory = createdMemories[i];
          const capsule = dueCapsules[i]; 
          const authorName = capsule.author.username;

          for (const member of familyMembers) {
             const isAuthor = member._id.toString() === capsule.author._id.toString();

             await createNotification({
                recipient: member._id,
                sender: capsule.author._id,
                type: 'memory_create', 
                payload: {
                   memoryId: memory._id,
                   message: isAuthor 
                     ? "Your time capsule has finally opened!" 
                     : `A time capsule from ${authorName} has opened!`
                }
             });
          }
       }
    }
    // ---------------------------------------------------------
    // END OF AUTO-PUBLISH
    // ---------------------------------------------------------

    // Base Query
    let query = { family: familyId };

    // ---------------------------------------------------------
    // 🛡️ STRICT VISIBILITY FILTER
    // ---------------------------------------------------------
    const visibilityFilter = {
      $or: [
        { author: currentUserId },        
        { visibility: 'family' },         
        { visibility: { $exists: false } },
        { visibility: 'selected', sharedWith: currentUserId },
      ]
    };

    // ---------------------------------------------------------
    // 1. 🔎 SEARCH
    // ---------------------------------------------------------
    if (search) {
      const searchRegex = new RegExp(search, 'i'); 
      const [matchingUsers, matchingPersons] = await Promise.all([
        User.find({ username: searchRegex }).select('_id'),
        Person.find({ name: searchRegex, family: familyId }).select('_id')
      ]);

      const isDate = !isNaN(Date.parse(search));
      
      const searchConditions = [
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
        searchConditions.push({ date: { $gte: start, $lt: end } });
      }

      query = {
        $and: [
          query,
          visibilityFilter,
          { $or: searchConditions }
        ]
      };
    }

    // ---------------------------------------------------------
    // 2. 🔒 PRIVATE FILTER
    // ---------------------------------------------------------
    else if (visibility === 'private') {
      query.author = currentUserId;
      query.visibility = 'private';
    }

    // ---------------------------------------------------------
    // 3. 👤 USER PROFILE VIEW
    // ---------------------------------------------------------
    else if (userId) {
      let targetPersonId;
      const targetUser = await User.findById(userId).select('primaryPerson');
      
      if (targetUser?.primaryPerson) {
        targetPersonId = targetUser.primaryPerson;
      } else {
        const linked = await Person.findOne({ user: userId }).select('_id');
        if (linked) targetPersonId = linked._id;
      }

      const userFilter = targetPersonId 
        ? { $or: [{ author: userId }, { taggedPersons: targetPersonId }] }
        : { author: userId };

      query = {
        $and: [
          query,
          userFilter,
          visibilityFilter
        ]
      };
      
      if (userId !== currentUserId.toString()) {
        query.visibility = { $ne: 'private' };
      }
    } 
    // ---------------------------------------------------------
    // 4. 🏠 DEFAULT FEED
    // ---------------------------------------------------------
    else {
      query = {
        $and: [
          query,
          visibilityFilter
        ]
      };
    }

    const memories = await Memory.find(query)
      .populate("author", "username avatarUrl")
      .populate("taggedPersons", "name user") 
      .populate("sharedWith", "username") 
      .sort({ date: -1 });

    res.json(memories);
  } catch (err) {
    console.error("Get Memories Error:", err);
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
      .populate("taggedPersons", "name avatarUrl user")
      .populate("sharedWith", "username avatarUrl");

    if (!memory) return res.status(404).json({ message: "Memory not found" });

    // Check Access for Single Memory
    const isAuthor = memory.author._id.toString() === req.user._id.toString();
    const isPublic = memory.visibility === 'family';
    const isShared = memory.visibility === 'selected' && memory.sharedWith.some(u => u._id.toString() === req.user._id.toString());
    
    if (!isAuthor && !isPublic && !isShared) {
         return res.status(403).json({ message: "You do not have permission to view this memory." });
    }

    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================================================
// 🟢 UPDATE MEMORY
// ========================================================
export const updateMemory = async (req, res) => {
  try {
    const oldMemory = req.memory; 

    // History Snapshot
    await MemoryVersion.create({
      memory: oldMemory._id,
      editor: req.user._id,
      previousTitle: oldMemory.title,
      previousDescription: oldMemory.description,
      previousMedia: oldMemory.media,
      createdAt: new Date()
    });

    // Handle Tagged Persons (Non-owner can only remove self)
    let finalTaggedPersons = req.body.taggedPersons;
    if (finalTaggedPersons) {
      const isOwner = req.user._id.toString() === oldMemory.author.toString();
      if (!isOwner) {
        const userPerson = await Person.findOne({ user: req.user._id, family: oldMemory.family });
        if (userPerson) {
            const oldTags = oldMemory.taggedPersons.map(id => id.toString());
            const requestedTags = finalTaggedPersons;
            const isRemovingSelf = !requestedTags.includes(userPerson._id.toString());
            
            if (isRemovingSelf) {
                finalTaggedPersons = oldTags.filter(id => id !== userPerson._id.toString());
            } else {
                finalTaggedPersons = oldTags;
            }
        } else {
             finalTaggedPersons = oldMemory.taggedPersons;
        }
      }
    }

    // UPDATE
    const updatedMemory = await Memory.findByIdAndUpdate(
      oldMemory._id,
      { 
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        taggedPersons: finalTaggedPersons,
        // ✅ Allow updating visibility & sharedWith
        visibility: req.body.visibility,
        sharedWith: req.body.sharedWith 
      },
      { new: true }
    )
    .populate("author", "username avatarUrl")
    .populate("taggedPersons", "name user");

    res.json(updatedMemory);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================================================
// 🟢 DELETE MEMORY
// ========================================================
export const deleteMemory = async (req, res) => {
  try {
    const memory = req.memory; 

    if (memory.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the author can delete this memory." });
    }

    await memory.deleteOne(); 
    await MemoryVersion.deleteMany({ memory: memory._id });

    res.json({ message: "Memory deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error during deletion" });
  }
};

// ... sendMemoryNotifications function remains the same ...
// You can keep the notification logic as it was, 
// just ensure you import Person and User correctly.
const sendMemoryNotifications = async (req, memory, familyId) => {
  try {
    let taggedUserIds = [];

    // Notify Tagged Persons
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

    // Notify Shared With (Selected Users)
    // 🟢 ADDED: Notify users in 'sharedWith' if visibility is 'selected'
    if (req.body.visibility === 'selected' && req.body.sharedWith?.length > 0) {
        for (const userId of req.body.sharedWith) {
            if (userId !== req.user._id.toString() && !taggedUserIds.includes(userId)) {
                 await createNotification({
                    recipient: userId,
                    sender: req.user._id,
                    type: 'memory_share', // You might need to handle this type in frontend
                    payload: {
                      memoryId: memory._id,
                      message: `${req.user.username} shared a memory with you.`
                    }
                  });
            }
        }
        return; // Stop here if selected, don't broadcast to whole family
    }

    // Notify Family (Broadcast - Only if visibility is FAMILY)
    if (req.body.visibility === 'family' || !req.body.visibility) {
        const familyMembers = await User.find({ families: familyId });
        for (const member of familyMembers) {
          const memberId = member._id.toString();
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
    }
  } catch (err) {
    console.error("Notification Error:", err);
  }
};