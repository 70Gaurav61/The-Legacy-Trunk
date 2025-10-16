import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateFamily({ user }) {
  const [familyName, setFamilyName] = useState("");
  const [password, setPassword] = useState("");
  const [familyId, setFamilyId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [personData, setPersonData] = useState({
    name: user?.name || "",
    dob: "",
    gender: "male",
    relationType: "other",
    bio: "",
    avatarUrl: user?.avatarUrl || "",
  });

  const [step, setStep] = useState(1); // step 1: create family, step 2: add person
  const navigate = useNavigate();

  const handlePersonChange = (e) => {
    setPersonData({ ...personData, [e.target.name]: e.target.value });
  };

  // Step 1: Create Family
  const createFamily = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/families",
        { name: familyName, password },
        { withCredentials: true }
      );

      console.log("Family created:", res.data);
      setFamilyId(res.data._id); // store familyId for next step
      setStep(2); // move to adding first person
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create family");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add First Person (include familyId in body)
  const addPerson = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/api/v1/persons",
        { ...personData, family: familyId },
        { withCredentials: true }
      );
      navigate("/dashboard"); // redirect after success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white">
      {/* STEP 1: CREATE FAMILY */}
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
            Create Family
          </h2>
          <form onSubmit={createFamily} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Family Name</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              {loading ? "Creating..." : "Create Family"}
            </button>
          </form>
        </>
      )}

      {/* STEP 2: ADD FIRST PERSON */}
      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
            Add Your Profile
          </h2>
          <form onSubmit={addPerson} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={personData.name}
                onChange={handlePersonChange}
                required
                className="mt-1 block w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">DOB</label>
              <input
                type="date"
                name="dob"
                value={personData.dob}
                onChange={handlePersonChange}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select
                name="gender"
                value={personData.gender}
                onChange={handlePersonChange}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Relation Type</label>
              <select
                name="relationType"
                value={personData.relationType}
                onChange={handlePersonChange}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="spouse">Spouse</option>
                <option value="sibling">Sibling</option>
                <option value="grandfather">Grandfather</option>
                <option value="grandmother">Grandmother</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Bio</label>
              <textarea
                name="bio"
                value={personData.bio}
                onChange={handlePersonChange}
                className="mt-1 block w-full border rounded p-2"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium">Avatar URL</label>
              <input
                type="text"
                name="avatarUrl"
                value={personData.avatarUrl}
                onChange={handlePersonChange}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              {loading ? "Adding..." : "Add Profile"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
