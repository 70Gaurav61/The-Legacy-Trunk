import React from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiGitMerge } from "react-icons/fi"; // GitMerge icon looks like a tree node

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:flex flex-col gap-4 p-6 border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16 bg-white">
      
      {/* 3. Create Story Button */}
      <Link 
        to="/create-post" 
        className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-300 rounded-2xl bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-500 transition-all cursor-pointer text-center"
      >
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
          <FiPlus size={24} />
        </div>
        <span className="font-bold text-indigo-900">Create Your Own Story</span>
        <span className="text-xs text-indigo-500 mt-1">Add photos & videos</span>
      </Link>

      {/* 4. Family Tree Button */}
      <Link 
        to="/family-tree" 
        className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-2xl hover:shadow-md hover:border-gray-300 transition-all text-center bg-white"
      >
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
          <FiGitMerge size={24} />
        </div>
        <span className="font-bold text-gray-800">Show Family Tree</span>
        <span className="text-xs text-gray-400 mt-1">View your lineage</span>
      </Link>

    </aside>
  );
}