import React from "react";

const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function MemoriesFeed({ memories }) {
  const grouped = memories.reduce((acc, item) => {
    // Check if date exists, otherwise use createdAt or today
    const dateKey = formatDate(item.date || item.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400">
        <div className="text-6xl mb-4">📸</div>
        <p>No memories found here yet.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 pb-20">
      {sortedDates.map((date) => (
        <div key={date} className="animate-fadeIn">
          <h3 className="text-xl font-bold text-gray-800 mb-4 sticky top-20 z-10 bg-gray-50/95 backdrop-blur py-2 w-max px-4 rounded-full shadow-sm border border-gray-100">
            {date}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped[date].map((memory) => {
              // 🟢 FIX 1: Access the first item in the media array
              const mediaItem = memory.media && memory.media[0] ? memory.media[0] : null;
              
              if (!mediaItem) return null; // Skip empty memories

              // 🟢 FIX 2: Determine type from mimeType (backend stores 'image/png', etc.)
              const isVideo = mediaItem.mimeType?.startsWith("video");

              return (
                <div key={memory._id} className="group relative rounded-2xl overflow-hidden shadow-sm bg-gray-200 hover:shadow-lg transition-all duration-300 aspect-[4/3] cursor-pointer">
                  
                  {isVideo ? (
                    <video src={mediaItem.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={mediaItem.url} alt="memory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-4">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                      {/* 🟢 FIX 3: Use 'description' (from Model) instead of 'caption' */}
                      <p className="text-sm font-semibold truncate">{memory.description || memory.title || "Untitled"}</p>
                      
                      {/* 🟢 FIX 4: Access populated author username */}
                      <p className="text-xs opacity-80">
                        Uploaded by {memory.author?.username || "Family Member"}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}