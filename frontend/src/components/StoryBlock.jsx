// src/components/StoryBlock.js

import React from 'react';

function StoryBlock({ type = 'normal' }) {
  let sizeClasses = 'col-span-1 aspect-video'; // Default size
  
  if (type === 'wide') {
    sizeClasses = 'sm:col-span-2 aspect-[2/1] lg:aspect-[unset] lg:h-80'; // Takes up 2 columns
  }
  // Note: 'tall' would use 'row-span-2' but requires a specific grid setup.

  return (
    <div 
      className={`
        ${sizeClasses} 
        bg-gray-200 rounded-xl shadow-lg 
        hover:shadow-xl transition-all duration-300 
        flex items-center justify-center 
        text-gray-500 text-sm overflow-hidden
      `}
    >
      {/* Placeholder for Image/Video Content */}
      <span className='p-4'>Story Content Area ({type})</span>
    </div>
  );
}
export default StoryBlock;