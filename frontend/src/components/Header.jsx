

import React from 'react';
import SearchBox from './SearchBox';
import ProfileAvatar from './ProfileAvatar';

function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-100">
      <div className="text-2xl font-bold text-indigo-700 tracking-tight">
        Legacy Trunk
      </div>
      
      {/* Search Box in the center */}
      <div className="hidden sm:block">
        <SearchBox />
      </div>

      {/* Profile and Story on the right */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-500 hidden md:block">
          my private story
        </span>
        <ProfileAvatar />
      </div>
    </header>
  );
}

export default Header;