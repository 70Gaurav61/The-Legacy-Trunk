import React, { useState } from "react";
import { api } from "../services/useAuth.jsx"; // 🟢 FIX: Use shared API client
import { useNavigate } from "react-router-dom";
import { 
  FiHash, FiLock, FiUser, FiCalendar, FiUsers, FiLink, FiImage, FiArrowRight, FiCheck, FiLoader, FiType
} from "react-icons/fi";

export default function JoinFamily({ user }) {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Step 1 Data (Join)
  const [familyCode, setFamilyCode] = useState("");
  const [password, setPassword] = useState("");
  const [familyId, setFamilyId] = useState(null);
  const [existingPersons, setExistingPersons] = useState([]);

  // Step 2 Data (Profile)
  const [personData, setPersonData] = useState({
    name: user?.username || "",
    dob: "",
    gender: "male",
    relationType: "son", // Default assumption, user can change
    relationTo: "",
    bio: "",
    avatarUrl: "",
    family: "",
  });

  const handlePersonChange = (e) => {
    setPersonData({ ...personData, [e.target.name]: e.target.value });
  };

  // --- LOGIC: JOIN FAMILY ---
  const joinFamily = async (e) => {
    e.preventDefault();
    setError("");
    if(!familyCode || !password) return setError("Family code and password are required");

    try {
      setLoading(true);
      // 🟢 FIX: Use 'api.post' (Base URL handled automatically)
      const res = await api.post("/families/join", { familyCode, password });
      
      console.log("Joined family:", res.data);
      const joinedFamilyId = res.data._id;
      setFamilyId(joinedFamilyId);

      // Fetch existing members so user can link themselves
      const personsRes = await api.get("/persons", {
        params: { familyId: joinedFamilyId },
      });
      
      setExistingPersons(personsRes.data);
      setStep(2); // Move to profile creation
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join family. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: ADD PROFILE ---
  const addPerson = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic Validation
    if(!personData.relationTo) return setError("Please select who you are related to in the tree.");

    try {
      setLoading(true);
      
      // 🟢 FIX: Include 'isSelf: true' so backend links User <-> Person
      await api.post("/persons", {
        ...personData, 
        family: familyId,
        isSelf: true 
      });

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-in-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          ></div>
        </div>

        <div className="p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {step === 1 ? "Join Existing Tree" : "Who are you?"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === 1 
                ? "Enter the code shared by your family admin." 
                : "Find your place in the family tree."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiType className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 1: JOIN FORM --- */}
          {step === 1 && (
            <form onSubmit={joinFamily} className="space-y-6 animate-fadeIn">
              
              {/* Family Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Invite Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHash className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors uppercase tracking-widest font-mono"
                    placeholder="XYZ-123"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02]"
              >
                {loading ? <FiLoader className="animate-spin mr-2" /> : "Access Tree"} 
                {!loading && <FiArrowRight className="ml-2" />}
              </button>
            </form>
          )}

          {/* --- STEP 2: PROFILE FORM --- */}
          {step === 2 && (
            <form onSubmit={addPerson} className="space-y-5 animate-fadeIn">
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                 Found <strong>{existingPersons.length}</strong> members. To connect you, tell us how you are related to someone already in the tree.
              </div>

              {/* Name & DOB Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={personData.name}
                      onChange={handlePersonChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={personData.dob}
                      onChange={handlePersonChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={personData.gender}
                    onChange={handlePersonChange}
                    className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* CONNECTION LOGIC */}
              <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 space-y-4">
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Family Connection</h3>
                
                {/* Relation To (Select Person) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connect me to...</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUsers className="text-gray-400" />
                    </div>
                    <select
                      name="relationTo"
                      value={personData.relationTo}
                      onChange={handlePersonChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select a Relative --</option>
                      {existingPersons.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Relation Type (Role) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I am their...</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLink className="text-gray-400" />
                    </div>
                    <select
                      name="relationType"
                      value={personData.relationType}
                      onChange={handlePersonChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="spouse">Spouse / Partner</option>
                      <option value="sibling">Sibling</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL (Optional)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiImage className="text-gray-400" />
                    </div>
                  <input
                    type="text"
                    name="avatarUrl"
                    value={personData.avatarUrl}
                    onChange={handlePersonChange}
                    placeholder="https://..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-[1.02]"
              >
                {loading ? <FiLoader className="animate-spin mr-2" /> : "Complete Setup"} 
                {!loading && <FiCheck className="ml-2" />}
              </button>
            </form>
          )}
        </div>
        
        {/* Footer Decoration */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
             <div className="flex gap-1">
                <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-indigo-500" : "bg-gray-300"}`}></div>
                <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-indigo-500" : "bg-gray-300"}`}></div>
             </div>
             <div className="text-xs text-gray-400">Step {step} of 2</div>
        </div>
      </div>
    </div>
  );
}