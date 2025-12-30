import React, { useState } from "react";
import { FiX, FiLock, FiLogOut, FiShield, FiAlertCircle } from "react-icons/fi";
import { api } from "../services/useAuth";

export default function SettingsModal({ user, onClose, onLogout }) {
  const [passwordData, setPasswordData] = useState({ current: "", new: "" });
  const [familyPassData, setFamilyPassData] = useState({ id: "", new: "" });
  const [status, setStatus] = useState({ type: "", message: "" }); // For success/error messages

  // 🟢 FILTER: Only show families where I am the Creator
  // We compare the creator ID with the current user ID
  const ownedFamilies = user?.families?.filter(f => 
    (typeof f.creator === 'object' ? f.creator._id : f.creator) === user._id
  ) || [];

  // Handle User Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    
    try {
      await api.put("/users/password", { 
        currentPassword: passwordData.current, 
        newPassword: passwordData.new 
      });
      setStatus({ type: "success", message: "Password updated successfully!" });
      setPasswordData({ current: "", new: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Failed to update password." });
    }
  };

  // Handle Family Password Change
  const handleFamilyPassChange = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      // Note: Ensure you have this route setup in your familyRoutes
      await api.put(`/families/${familyPassData.id}/password`, { 
        newPassword: familyPassData.new 
      });
      setStatus({ type: "success", message: "Family access updated!" });
      setFamilyPassData({ id: "", new: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Failed to update family password." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FiShield className="text-gray-400"/> Account Settings
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          
          {/* Status Message Area */}
          {status.message && (
            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              <FiAlertCircle /> {status.message}
            </div>
          )}

          {/* 1. Change User Password */}
          <section>
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-4">
              <FiLock className="text-blue-500"/> Change My Password
            </h4>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input 
                type="password" 
                placeholder="Current Password" 
                required
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                value={passwordData.current}
                onChange={e => setPasswordData({...passwordData, current: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="New Password" 
                required
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                value={passwordData.new}
                onChange={e => setPasswordData({...passwordData, new: e.target.value})}
              />
              <button 
                type="submit"
                className="w-full bg-gray-800 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-black transition-colors shadow-sm"
              >
                Update Password
              </button>
            </form>
          </section>

          {/* 2. Family Admin Settings (ONLY SHOW IF ADMIN) */}
          {ownedFamilies.length > 0 && (
            <section className="pt-6 border-t border-gray-100">
               <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 mb-2">
                 <FiShield /> Manage Family Passwords
               </h4>
               <p className="text-xs text-gray-400 mb-4">
                 You are the Admin of {ownedFamilies.length} family tree{ownedFamilies.length > 1 ? 's' : ''}.
               </p>
               
               <form onSubmit={handleFamilyPassChange} className="space-y-3">
                 <select 
                   className="w-full p-2.5 border border-orange-200 rounded-lg text-sm bg-orange-50 focus:bg-white focus:outline-none transition-all cursor-pointer"
                   onChange={e => setFamilyPassData({...familyPassData, id: e.target.value})}
                   required
                   value={familyPassData.id}
                 >
                   <option value="">Select Family...</option>
                   {ownedFamilies.map(f => (
                     <option key={f._id} value={f._id}>{f.name}</option>
                   ))}
                 </select>
                 
                 <input 
                   type="text" 
                   placeholder="New Family Password"
                   className="w-full p-2.5 border border-orange-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-400 transition-all"
                   value={familyPassData.new}
                   onChange={e => setFamilyPassData({...familyPassData, new: e.target.value})}
                   required
                 />
                 
                 <button 
                   type="submit"
                   className="w-full bg-orange-500 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                 >
                   Update Family Access
                 </button>
               </form>
            </section>
          )}

          {/* 3. Logout Zone */}
          <section className="pt-6 border-t border-gray-100">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 text-red-600 font-bold bg-red-50 py-3 rounded-xl hover:bg-red-100 hover:shadow-sm transition-all"
            >
              <FiLogOut /> Log Out
            </button>
          </section>
        
        </div>
      </div>
    </div>
  );
}