import Memory from "../models/Memory.js";
import User from "../models/User.js";
import Person from "../models/Person.js"; 

export const createMemory = async (req, res) => {
  try {
    const memoryData = {
      ...req.body,
      author: req.user._id,
      family: req.params.familyId, 
      date: req.body.date || new Date(),
    };

    if (req.files && req.files.length > 0) {
      memoryData.media = req.files.map(file => ({
        url: file.location, 
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

export const deleteMemory = async (req, res) => {
  try {
    await req.memory.remove();
    res.json({ message: "Memory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};