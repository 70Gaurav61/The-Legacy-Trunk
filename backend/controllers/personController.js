import Person from "../models/Person.js";
import User from "../models/User.js";

// 🟢 Add Person
export const addPerson = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const familyId = req.family?._id || user.families[0];
    if (!familyId) return res.status(400).json({ message: "No family found" });

    const personData = {
      name: req.body.name || user.name,
      avatarUrl: req.body.avatarUrl || user.avatarUrl,
      dob: req.body.dob,
      gender: req.body.gender || "male",
      relationType: req.body.relationType || "Admin",
      relationTo: req.body.relationTo || null,   // Default null; optional parent
      bio: req.body.bio || "",
      family: familyId,
      user: user._id,
    };

    const person = await Person.create(personData);

    // 🆕 If person has a parent, add to parent's children array
    if (person.relationTo) {
      await Person.findByIdAndUpdate(person.relationTo, {
        $addToSet: { children: person._id },
      });
    }

    user.persons.push(person._id);
    if (!user.primaryPerson) user.primaryPerson = person._id;
    await user.save();

    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🟢 Get persons in a family
export const getPersons = async (req, res) => {
  try {
    const familyId = req.family?._id;
    if (!familyId) return res.status(400).json({ message: "No family found" });

    const persons = await Person.find({ family: familyId })
      .populate("children", "name gender relationType avatarUrl")  // Populate children
      .populate("relationTo", "name gender relationType")          // Populate parent
      .lean();

    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Update Person
export const updatePerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.personId);
    if (!person) return res.status(404).json({ message: "Person not found" });

    Object.assign(person, req.body);
    await person.save();
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Delete Person
export const deletePerson = async (req, res) => {
  try {
    const deleted = await Person.findByIdAndDelete(req.params.personId);

    // 🆕 Remove from parent's children array if applicable
    if (deleted?.relationTo) {
      await Person.findByIdAndUpdate(deleted.relationTo, {
        $pull: { children: deleted._id },
      });
    }

    res.json({ message: "Person deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 Add Child to a Person
export const addChild = async (req, res) => {
  try {
    const { parentId } = req.params;
    const parent = await Person.findById(parentId);
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const childData = {
      name: req.body.name,
      dob: req.body.dob,
      gender: req.body.gender,
      family: parent.family,
      relationTo: parent._id,
      relationType: req.body.relationType || (parent.gender === "male" ? "son" : "daughter"),
      generation: parent.generation + 1,
      bio: req.body.bio || "",
      user: req.user._id,
    };

    const child = await Person.create(childData);

    parent.children.push(child._id);
    await parent.save();

    res.status(201).json(child);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 Get Family Tree by Current User (focus on primary person)
export const getCurrentUserTree = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("primaryPerson");
    if (!user || !user.primaryPerson)
      return res.status(404).json({ message: "No primary person found" });

    const familyId = req.family?._id || user.families[0];
    const persons = await Person.find({ family: familyId }).lean();

    // Build tree map
    const map = new Map();
    persons.forEach(p => map.set(p._id.toString(), { ...p, children: [] }));

    let root = null;
    persons.forEach(p => {
      if (p.relationTo && map.has(p.relationTo.toString())) {
        map.get(p.relationTo.toString()).children.push(map.get(p._id.toString()));
      }
      if (p._id.toString() === user.primaryPerson._id.toString()) {
        root = map.get(p._id.toString());
      }
    });

    res.json(root);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 Get Whole Family Tree (all roots)
export const getWholeFamilyTree = async (req, res) => {
  try {
    const familyId = req.family?._id;
    if (!familyId) return res.status(400).json({ message: "No family found" });

    const persons = await Person.find({ family: familyId }).lean();
    if (persons.length === 0)
      return res.status(404).json({ message: "No persons found in this family" });

    const map = new Map();
    persons.forEach(p => map.set(p._id.toString(), { ...p, children: [] }));

    let roots = [];
    persons.forEach(p => {
      if (p.relationTo && map.has(p.relationTo.toString())) {
        map.get(p.relationTo.toString()).children.push(map.get(p._id.toString()));
      } else {
        roots.push(map.get(p._id.toString())); // no parent → root
      }
    });

    res.json(roots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 Generic Family Tree (all roots, recursive) - optional alternative
export const getFamilyTree = async (req, res) => {
  try {
    const familyId = req.family?._id;
    if (!familyId) return res.status(400).json({ message: "No family found" });

    const persons = await Person.find({ family: familyId }).lean();

    const map = {};
    persons.forEach(p => (map[p._id.toString()] = { ...p, children: [] }));

    let roots = [];
    persons.forEach(p => {
      if (p.relationTo) {
        const parent = map[p.relationTo.toString()];
        if (parent) parent.children.push(map[p._id.toString()]);
      } else {
        roots.push(map[p._id.toString()]);
      }
    });

    res.json(roots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
