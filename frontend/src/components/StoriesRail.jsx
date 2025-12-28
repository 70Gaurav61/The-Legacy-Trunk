import React from "react";
import { FiGrid, FiUser } from "react-icons/fi";

export default function StoriesRail({ users, currentUser, selectedUser, onSelectUser }) {
  
  // Filter out 'Me' from the general list so I don't show up twice
  const otherUsers = users.filter(u => u._id !== currentUser?._id);

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-6 min-w-max">
        
        {/* 1. "All Albums" Option */}
        <button 
          onClick={() => onSelectUser(null)}
          className={`flex flex-col items-center gap-2 group ${!selectedUser ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${!selectedUser ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
            <FiGrid size={24} />
          </div>
          <span className={`text-xs font-bold ${!selectedUser ? 'text-indigo-600' : 'text-gray-500'}`}>All Albums</span>
        </button>

        {/* Separator */}
        <div className="h-10 w-px bg-gray-200"></div>

        {/* 2. "My Memories" (Current User) */}
        {currentUser && (
          <button 
            onClick={() => onSelectUser(currentUser._id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`p-[2px] rounded-full transition-all ${selectedUser === currentUser._id ? 'bg-indigo-600 scale-110' : 'bg-gradient-to-tr from-indigo-400 to-purple-400 hover:scale-105'}`}>
              <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
                 {/* Try to show avatar, fallback to Icon */}
                 {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Me" className="w-full h-full object-cover" />
                 ) : (
                    <FiUser className="text-gray-400" size={24} />
                 )}
              </div>
            </div>
            <span className={`text-xs font-medium ${selectedUser === currentUser._id ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
              My Memories
            </span>
          </button>
        )}

        {/* 3. Other Family Members */}
        {otherUsers.map((u) => {
            // Your controller populates 'primaryPerson', so we check that first for the name/avatar
            const displayName = u.primaryPerson?.name || u.username;
            const displayAvatar = u.primaryPerson?.avatarUrl || u.avatarUrl;

            return (
              <button 
                key={u._id} 
                onClick={() => onSelectUser(u._id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`p-[2px] rounded-full transition-all ${selectedUser === u._id ? 'bg-indigo-600 scale-110' : 'bg-gradient-to-tr from-pink-400 to-orange-400 hover:scale-105'}`}>
                  <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                    <img 
                      src={displayAvatar || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                      alt={displayName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium max-w-[70px] truncate ${selectedUser === u._id ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
                  {displayName}
                </span>
              </button>
            );
        })}

      </div>
    </div>
  );
}