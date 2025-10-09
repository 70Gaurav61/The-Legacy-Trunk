import Person from "../models/Person.js";

// Add Person
export const addPerson = async (req, res) => {
  try {
    const person = await Person.create({ ...req.body, family: req.family._id });
    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get persons in a family
export const getPersons = async (req, res) => {
  try {
    const persons = await Person.find({ family: req.family._id });
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
