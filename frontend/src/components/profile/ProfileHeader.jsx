import React, { useRef } from "react";
import { FiSettings, FiCamera, FiEdit2, FiSave } from "react-icons/fi";

export default function ProfileHeader({ 
  user, 
  previewUrl, 
  isEditing, 
  setIsEditing, 
  handleSave, 
  handleImageChange, 
  onOpenSettings,
  isOwner = true
}) {
  const fileInputRef = useRef(null);

  return (
    <>
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 h-64 sm:rounded-b-3xl shadow-lg">
        {isOwner && (
          <button 
            onClick={onOpenSettings} 
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <FiSettings size={24} />
          </button>
        )}
        
        <div className="absolute -bottom-16 left-8 flex items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
               <img 
                 src={previewUrl || user?.primaryPerson?.avatarUrl || "https://via.placeholder.com/150"} 
                 alt="Profile" 
                 className="w-full h-full object-cover"
               />
            </div>
            {isEditing && (
              <div 
                onClick={() => fileInputRef.current.click()} 
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-[2px]"
              >
                <FiCamera className="text-white text-2xl" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-20 px-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user?.username}</h1>
          <p className="text-gray-500 text-sm font-medium">Joined {new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
        
        {isOwner && (
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-md transform hover:scale-105 active:scale-95 ${
              isEditing 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {isEditing ? <><FiSave /> Save Profile</> : <><FiEdit2 /> Edit Profile</>}
          </button>
        )}
      </div>
    </>
  );
}