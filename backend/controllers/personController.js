import Person from "../models/Person.js";
import User from "../models/User.js";

// Add Person
export const addPerson = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // from JWT auth middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    // Use family from middleware if available, otherwise fallback to user's first family
    const familyId = req.family?._id || user.families[0];
    if (!familyId) return res.status(400).json({ message: "No family found" });

    // Auto-fill some fields from user if not provided
    const personData = {
      name: req.body.name || user.name,
      avatarUrl: req.body.avatarUrl || user.avatarUrl,
      dob: req.body.dob,
      gender: req.body.gender || "male",
      relationType: req.body.relationType || "other",
      bio: req.body.bio || "",
      family: familyId,
      user: user._id,
    };

    const person = await Person.create(personData);

    // Add person to user's persons array and set primaryPerson if none
    user.persons.push(person._id);
    if (!user.primaryPerson) user.primaryPerson = person._id;
    await user.save();

    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get persons in a family
export const getPersons = async (req, res) => {
  try {
    const familyId = req.family?._id;
    if (!familyId) return res.status(400).json({ message: "No family found" });

    const persons = await Person.find({ family: familyId });
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Person
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

// Delete Person
export const deletePerson = async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.personId);
    res.json({ message: "Person deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
