
import React from 'react';
import Header from '../components/Header';
import UserStoryNavigation from '../components/UserStoryNavigation';
import Sidebar from '../components/Sidebar';
import MainContentFeed from '../components/MainContentFeed';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header and Nav are full width */}
      <UserStoryNavigation />
      
      {/* Main Content Area: Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-6 p-6 max-w-7xl mx-auto">
        <Sidebar />
        <MainContentFeed />
      </div>
    </div>
  );
}

export default Home;