

import React from 'react';
import { Search } from 'lucide-react'; // Example using a popular icon library

function SearchBox() {
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-400 transition-all w-80">
      <input
        type="text"
        placeholder="Search stories, users, or dates..."
        className="bg-transparent p-2 outline-none w-full text-sm placeholder-gray-500"
      />
      <button className="text-gray-600 p-2 hover:text-indigo-600 transition">
        <Search size={20} />
      </button>
    </div>
  );
}
export default SearchBox;