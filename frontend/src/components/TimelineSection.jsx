// src/components/TimelineSection.js

import React from 'react';
import StoryBlock from './StoryBlock';

function TimelineSection({ date, stories }) {
  return (
    <section>
      {/* Date Header */}
      <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-3">
        {date}
      </h2>
      
      {/* Story Grid - Responsive and dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story, index) => (
          <StoryBlock key={index} type={story.type} />
        ))}
      </div>
    </section>
  );
}
export default TimelineSection;