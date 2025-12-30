import React from "react";
import { FiMail, FiCalendar, FiUsers } from "react-icons/fi";

export default function UserInfoCard({ user, isEditing, formData, setFormData }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div>
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">About Me</h3>
        {isEditing ? (
          <textarea 
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
            rows="4"
            value={formData.bio} 
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell your family about yourself..."
          />
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed">{user?.primaryPerson?.bio || "No bio yet."}</p>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-4">
         <InfoItem icon={<FiMail/>} label="Email" value={user?.email} />
         
         <InfoItem 
           icon={<FiCalendar/>} 
           label="Born" 
           value={isEditing ? (
             <input 
               type="date" 
               value={formData.dob} 
               onChange={(e)=>setFormData({...formData, dob:e.target.value})} 
               className="border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-sm focus:outline-none focus:border-blue-500"
             />
           ) : (
             user?.primaryPerson?.dob ? new Date(user.primaryPerson.dob).toLocaleDateString() : "N/A"
           )} 
         />
         
         <InfoItem 
           icon={<FiUsers/>} 
           label="Gender" 
           value={isEditing ? (
             <select 
                value={formData.gender} 
                onChange={(e)=>setFormData({...formData, gender:e.target.value})} 
                className="border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-sm focus:outline-none focus:border-blue-500"
             >
               <option value="male">Male</option>
               <option value="female">Female</option>
               <option value="other">Other</option>
             </select>
           ) : (
             <span className="capitalize">{user?.primaryPerson?.gender || "Not set"}</span>
           )} 
         />
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);