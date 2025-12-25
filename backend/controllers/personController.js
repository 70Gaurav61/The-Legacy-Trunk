import Person from "../models/Person.js";
import User from "../models/User.js";
import crypto from "crypto";
import mongoose from "mongoose";

// ==========================================
// 🧠 HELPER: Recursive Tree Builder (Dynamic Depth)
// ==========================================
const nestChildren = (rootId, allPeople, allSpouses, currentLevel) => {
  // 1. Filter for Children Only (Strictly Son/Daughter)
  const children = allPeople.filter(p => 
    p.relationTo && 
    p.relationTo.toString() === rootId.toString() &&
    ["son", "daughter"].includes(p.relationType)
  );

  if (children.length === 0) return [];

  return children.map(child => {
    // 2. Find Spouse for this child (STRICT CHECK)
    // 🟢 FIX: Ensure the person found is actually a SPOUSE, not another child/sibling
    let spouse = allSpouses.find(s => 
      s.relationTo && 
      s.relationTo.toString() === child._id.toString() &&
      ["spouse", "wife", "husband"].includes(s.relationType) // 👈 CRITICAL FIX
    );

    // Check reverse link (Child -> Spouse)
    if (!spouse) {
      spouse = allSpouses.find(s => 
        child.relationTo && 
        child.relationTo.toString() === s._id.toString() &&
        ["husband", "wife", "spouse"].includes(child.relationType)
      );
    }

    return {
      _id: child._id,
      name: child.name,
      gender: child.gender,
      avatarUrl: child.avatarUrl,
      relationType: child.relationType,
      generation: currentLevel, 

      spouse: spouse ? { 
        _id: spouse._id, 
        name: spouse.name, 
        gender: spouse.gender, 
        avatarUrl: spouse.avatarUrl,
        relationType: spouse.relationType,
        generation: currentLevel 
      } : null,
      
      children: nestChildren(child._id, allPeople, allSpouses, currentLevel + 1)
    };
  });
};

// ==========================================
// 🟢 CONTROLLER METHODS
// ==========================================

// 1. Add Person
export const addPerson = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const familyId = req.family?._id || user.families[0];
    if (!familyId) return res.status(400).json({ message: "You must join a family first." });

    let finalRelationTo = req.body.relationTo;
    let finalRelationType = req.body.relationType;
    let isGraftingUpwards = ["father", "mother"].includes(finalRelationType?.toLowerCase());

    // Link Mother as Spouse if Father exists
    if (isGraftingUpwards && req.body.relationTo) {
      const child = await Person.findById(req.body.relationTo);
      if (child && child.relationTo) {
         finalRelationTo = child.relationTo; 
         finalRelationType = "spouse";
         isGraftingUpwards = false;
      }
    }

    const personData = {
      name: req.body.name || user.username,
      avatarUrl: req.body.avatarUrl,
      dob: req.body.dob,
      gender: req.body.gender || "male",
      family: familyId,
      user: req.body.isSelf ? user._id : null,
      isClaimed: req.body.isSelf ? true : false,
      relationTo: isGraftingUpwards ? null : (finalRelationTo || null),
      relationType: isGraftingUpwards ? "other" : (finalRelationType || "other") 
    };

    const newPerson = await Person.create(personData);

    if (isGraftingUpwards && req.body.relationTo) {
      const childId = req.body.relationTo; 
      const childPerson = await Person.findById(childId);
      if (childPerson) {
        const reverseRelation = childPerson.gender === "male" ? "son" : "daughter";
        await Person.findByIdAndUpdate(childId, {
          relationTo: newPerson._id,   
          relationType: reverseRelation 
        });
      }
    }

    if (req.body.isSelf) {
      user.primaryPerson = newPerson._id;
    }
    
    user.persons.push(newPerson._id);
    await user.save();

    res.status(201).json(newPerson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. Generate Invite Code
export const generateClaimCode = async (req, res) => {
  try {
    const { personId } = req.params;
    const user = await User.findById(req.user._id);
    const managesPerson = user.persons.some(p => p.toString() === personId);
    if (!managesPerson && user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to invite this person" });
    }
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); 
    await Person.findByIdAndUpdate(personId, { claimCode: code });
    res.json({ success: true, claimCode: code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Get Descendants
export const getDescendants = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("persons");
    let rootPersonId = user.primaryPerson;

    if (!rootPersonId) {
       const linkedPerson = await Person.findOne({ user: user._id });
       if (linkedPerson) {
           rootPersonId = linkedPerson._id;
           await User.findByIdAndUpdate(user._id, { primaryPerson: linkedPerson._id });
       }
    }

    if (!rootPersonId) return res.status(404).json({ message: "No Primary Person found." });

    let rootPersonObj = user.persons.find(p => p._id.toString() === rootPersonId.toString()) 
                          || await Person.findById(rootPersonId);
    
    let searchId = rootPersonId;
    if (rootPersonObj.relationTo && ["wife", "husband", "spouse"].includes(rootPersonObj.relationType)) {
        searchId = rootPersonObj.relationTo; 
    }

    const descendantsData = await Person.aggregate([
      { $match: { _id: searchId } },
      {
        $graphLookup: {
          from: "people",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "relationTo",
          as: "biologicalDescendants",
          restrictSearchWithMatch: { relationType: { $in: ["son", "daughter"] } }
        }
      }
    ]);

    const biologicalList = descendantsData[0]?.biologicalDescendants || [];
    const descendantIds = biologicalList.map(p => p._id);

    const spousesList = await Person.find({
      relationTo: { $in: [searchId, ...descendantIds] }, 
      relationType: { $in: ["husband", "wife", "spouse"] } 
    }).lean(); 

    let rootSpouseObj = null;
    if (searchId.toString() !== rootPersonId.toString()) {
        rootSpouseObj = await Person.findById(searchId); 
    } else {
        rootSpouseObj = spousesList.find(s => s.relationTo.toString() === rootPersonId.toString());
    }

    const nestedTree = nestChildren(searchId, biologicalList, spousesList, 2);

    res.json({
      rootPerson: rootPersonObj,
      rootSpouse: rootSpouseObj,
      descendants: nestedTree
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Get Ancestors
export const getAncestors = async (req, res) => {
  try {
    let startPersonId = req.params.personId;
    if (!startPersonId) {
      const user = await User.findById(req.user._id);
      startPersonId = user.primaryPerson;
      if (!startPersonId) {
         const linkedPerson = await Person.findOne({ user: user._id });
         if (linkedPerson) {
             startPersonId = linkedPerson._id;
             await User.findByIdAndUpdate(user._id, { primaryPerson: linkedPerson._id });
         }
      }
    }
    
    if (!startPersonId) return res.status(404).json({ message: "No person found" });

    const ancestorsData = await Person.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(startPersonId) } },
      {
        $graphLookup: {
          from: "people",
          startWith: "$relationTo",
          connectFromField: "relationTo",
          connectToField: "_id",
          as: "lineage",
          depthField: "level"
        }
      }
    ]);

    const rootPerson = ancestorsData[0];
    if (!rootPerson) return res.status(404).json({ message: "Person not found" });

    const directAncestors = rootPerson.lineage || [];
    const ancestorIds = directAncestors.map(p => p._id);
    
    const spouses = await Person.find({
      relationTo: { $in: ancestorIds },
      relationType: { $in: ["husband", "wife", "spouse"] } 
    }).lean();

    const formattedAncestors = directAncestors.map(ancestor => {
      const spouse = spouses.find(s => s.relationTo && s.relationTo.toString() === ancestor._id.toString());
      return {
        _id: ancestor._id,
        name: ancestor.name,
        gender: ancestor.gender, 
        avatarUrl: ancestor.avatarUrl,
        level: ancestor.level,
        relationType: ancestor.relationType,
        spouse: spouse ? { name: spouse.name, gender: spouse.gender, avatarUrl: spouse.avatarUrl } : null
      };
    });

    formattedAncestors.sort((a, b) => a.level - b.level);

    res.json({ success: true, ancestors: formattedAncestors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Get Whole Tree (With STRICT Spouse Check)
export const getFullTree = async (req, res) => {
  try {
    const familyId = req.family?._id;
    if (!familyId) return res.status(400).json({ message: "No family found" });

    const allPeople = await Person.find({ family: familyId }).lean();
    if (allPeople.length === 0) return res.json({ tree: [] });

    // Find Roots (No parents)
    const roots = allPeople.filter(p => {
       if (!p.relationTo) return true; 
       if (["other"].includes(p.relationType)) return true;
       const parentExists = allPeople.some(parent => parent._id.toString() === p.relationTo.toString());
       return !parentExists; 
    });

    const tree = roots.map(root => {
      // 🟢 FIX: Strict Spouse Check for Roots
      // Don't grab a son/daughter as a spouse
      let spouse = allPeople.find(s => 
        s.relationTo && 
        s.relationTo.toString() === root._id.toString() &&
        ["spouse", "wife", "husband"].includes(s.relationType) // 👈 CRITICAL FIX
      );
      
      if (!spouse) {
        spouse = allPeople.find(s => 
          root.relationTo && 
          root.relationTo.toString() === s._id.toString() &&
          ["husband", "wife", "spouse"].includes(root.relationType)
        );
      }
      
      if (["wife", "spouse"].includes(root.relationType) && root.relationTo) return null;

      return {
        _id: root._id,
        name: root.name,
        gender: root.gender,
        avatarUrl: root.avatarUrl,
        generation: 1, 
        spouse: spouse ? { 
            _id: spouse._id, 
            name: spouse.name, 
            gender: spouse.gender, 
            avatarUrl: spouse.avatarUrl,
            generation: 1 
        } : null,
        children: nestChildren(root._id, allPeople, allPeople, 2) 
      };
    }).filter(Boolean);

    res.json({ success: true, tree });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Get Flat List
export const getPersons = async (req, res) => {
  try {
    const persons = await Person.find({ family: req.family._id }).populate("relationTo", "name").lean();
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Update Person
export const updatePerson = async (req, res) => { 
  try {
    const person = await Person.findByIdAndUpdate(req.params.personId, req.body, { new: true });
    res.json(person);
  } catch(err) { res.status(500).json({message: err.message}) }
};

// 8. Delete Person
export const deletePerson = async (req, res) => { 
  try {
    await Person.findByIdAndDelete(req.params.personId);
    res.json({ message: "Deleted" });
  } catch(err) { res.status(500).json({message: err.message}) }
};