
import React from 'react';

function UserAvatarCircle({ label, type }) {
  const isAlbum = type === 'album';

  return (
    <button
      className={`
        flex-shrink-0 h-20 w-20 rounded-full flex flex-col items-center justify-center text-xs font-semibold 
        transition-all duration-200 shadow-md cursor-pointer
        ${isAlbum 
          ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 hover:bg-indigo-600'
          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-400'
        }
      `}
      title={label}
    >
      {/* Placeholder for content/icon */}
      <div className="text-sm">🖼️</div> 
      <div className="mt-1 text-center">{label}</div>
    </button>
  );
}
export default UserAvatarCircle;