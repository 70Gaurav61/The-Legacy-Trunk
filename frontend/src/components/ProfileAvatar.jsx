import React from 'react';
import { Link } from 'react-router-dom';

function ProfileAvatar({ user }) {
  // Safety check: If no user is passed, return a generic placeholder or null
  if (!user) return null;

  // Get the display letter (First letter of username or "U" for user)
  const initial = user.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <Link to="/profile" title="Go to Profile">
      <div 
        className={`
          h-10 w-10 rounded-full border-2 border-white shadow-lg cursor-pointer 
          flex items-center justify-center overflow-hidden transition-all
          hover:ring-4 hover:ring-indigo-300
          ${user.avatarUrl ? 'bg-white' : 'bg-indigo-500'}
        `}
      >
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.username} 
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-white font-semibold text-lg select-none">
            {initial}
          </span>
        )}
      </div>
    </Link>
  );
}

export default ProfileAvatar;