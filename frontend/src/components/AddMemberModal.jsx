import React, { useState } from "react";
import { FiX, FiUserPlus, FiLoader } from "react-icons/fi";

export default function AddMemberModal({ isOpen, onClose, config, onSave }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", dob: "", gender: "male" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 🧠 LOGIC: Determine Relation Type
    let finalRelationType = "other";

    if (config.type === "child") {
        finalRelationType = formData.gender === "male" ? "son" : "daughter";
    } else if (config.type === "parent") {
        finalRelationType = formData.gender === "male" ? "father" : "mother";
    } else if (config.type === "spouse") {
        // 🟢 ADDED: Spouse Logic
        finalRelationType = "spouse"; 
    }

    const payload = {
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        relationTo: config.personId, // The person we are linking to
        relationType: finalRelationType,
        isSelf: false 
    };

    await onSave(payload);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <FiUserPlus /> 
            {config.type === "spouse" ? "Add Spouse" : config.type === "child" ? "Add Child" : "Add Parent"} 
            <span className="opacity-70 text-xs font-normal ml-1">for {config.personName}</span>
          </h3>
          <button onClick={onClose}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
                    value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">DOB</label>
                <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
                    value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg">
            {loading ? <FiLoader className="animate-spin inline mr-2"/> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}