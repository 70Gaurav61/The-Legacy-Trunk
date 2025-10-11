
import React from 'react';
import UserAvatarCircle from './UserAvatarCircle';

// Mock data
const userStories = [
  { id: 1, label: 'All albums', type: 'album' },
  { id: 2, label: 'user', type: 'user' },
  { id: 3, label: 'user', type: 'user' },
  { id: 4, label: 'user', type: 'user' },
  { id: 5, label: 'user', type: 'user' },
  { id: 6, label: 'user', type: 'user' },
  { id: 7, label: 'user', type: 'user' },
  { id: 8, label: 'user', type: 'user' },
  { id: 9, label: 'user', type: 'user' },
  { id: 10, label: 'user', type: 'user' },
  { id: 11, label: 'user', type: 'user' },
  { id: 12, label: 'user', type: 'user' },
];

function UserStoryNavigation() {
  return (
    <nav className="relative border-b border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide">
        {userStories.map(story => (
          <UserAvatarCircle key={story.id} label={story.label} type={story.type} />
        ))}
      </div>
      
      {/* Fading Right Indicator */}
      <div className="absolute top-0 right-0 h-full w-16 pointer-events-none bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-4">
        <span className="text-xl font-bold text-gray-500">→</span>
      </div>
    </nav>
  );
}

export default UserStoryNavigation;