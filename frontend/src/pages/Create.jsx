import React, { useState } from "react";
import { api } from "../services/useAuth.jsx"; 
import { useNavigate } from "react-router-dom";
import { 
  FiHome, FiLock, FiUser, FiCalendar, FiImage, FiType, FiCheck, FiArrowRight, FiLoader 
} from "react-icons/fi";

export default function CreateFamily({ user }) {
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Step 1 Data
  const [familyName, setFamilyName] = useState("");
  const [password, setPassword] = useState("");
  const [familyId, setFamilyId] = useState(null);

  // Step 2 Data
  const [personData, setPersonData] = useState({
    name: user?.username || "", 
    dob: "",
    gender: "male",
    relationType: "other",
    bio: "",
    avatarUrl: "",
  });

  const handlePersonChange = (e) => {
    setPersonData({ ...personData, [e.target.name]: e.target.value });
  };

  // --- LOGIC: CREATE FAMILY ---
  const createFamily = async (e) => {
    e.preventDefault();
    setError("");
    if(!familyName || !password) return setError("Family name and password are required");

    try {
      setLoading(true);
      const res = await api.post("/families", { name: familyName, password });
      console.log("Family created:", res.data);
      setFamilyId(res.data._id); 
      setStep(2); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create family");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: ADD PROFILE ---
  const addPerson = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await api.post("/persons", { 
        ...personData, 
        family: familyId,
        isSelf: true // 👈 Critical Link
      });
      navigate("/dashboard"); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        
        {/* Progress Bar at Top */}
        <div className="h-1.5 w-full bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-in-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          ></div>
        </div>

        <div className="p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {step === 1 ? "Start Your Legacy" : "Who are you?"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === 1 
                ? "Create a secure space for your family tree." 
                : "Let's set up your personal profile card."}
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

          {/* --- STEP 1 FORM --- */}
          {step === 1 && (
            <form onSubmit={createFamily} className="space-y-6 animate-fadeIn">
              
              {/* Family Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHome className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="The Smith Family"
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
                    placeholder="Create a secret key"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Shared with members to join this tree.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02]"
              >
                {loading ? <FiLoader className="animate-spin mr-2" /> : "Create Family"} 
                {!loading && <FiArrowRight className="ml-2" />}
              </button>
            </form>
          )}

          {/* --- STEP 2 FORM --- */}
          {step === 2 && (
            <form onSubmit={addPerson} className="space-y-5 animate-fadeIn">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
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

                {/* DOB */}
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

                {/* Gender */}
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

              {/* Avatar URL + Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
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
                  {/* Live Preview Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    {personData.avatarUrl ? (
                      <img src={personData.avatarUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.target.style.display='none'} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400"><FiUser /></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={personData.bio}
                  onChange={handlePersonChange}
                  className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell us a little about yourself..."
                ></textarea>
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