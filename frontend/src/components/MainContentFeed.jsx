// src/components/MainContentFeed.js

import React from 'react';
import TimelineSection from './TimelineSection';

// Mock data
const feedData = [
  { date: 'oct 8', stories: [
    { type: 'wide' }, 
    { type: 'tall' } // Not shown in wireframe, but good for variation
  ]},
  { date: 'nov 5', stories: [
    { type: 'normal' }, 
    { type: 'normal' }
  ]},
  { date: 'dec 12', stories: [
    { type: 'wide' },
    { type: 'normal' },
    { type: 'normal' },
  ]},
];

function MainContentFeed() {
  return (
    <main className="main-content-feed space-y-12">
      {feedData.map((section, index) => (
        <TimelineSection key={index} date={section.date} stories={section.stories} />
      ))}
    </main>
  );
}

export default MainContentFeed;