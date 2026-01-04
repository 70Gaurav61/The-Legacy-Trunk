import React from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function MemoriesFeed({ 
  memories, 
  layout = "feed", 
  onDelete,        
  onEdit,          
  openMenuId,      
  setOpenMenuId,   
  isOwner = false  
}) {
  const navigate = useNavigate();

  if (!memories || memories.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-gray-400 ${layout === 'grid' ? 'py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200' : 'h-96'}`}>
        <FiImage className="text-4xl mb-3 opacity-30"/>
        <p className="font-medium">No memories found.</p>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 animate-fadeIn">
        {memories.map((memory) => (
          <MemoryThumbnail 
            key={memory._id}
            memory={memory}
            navigate={navigate}
            
            // 🟢 Determine if menu should show at all (If ANY action is possible)
            showMenu={!!onDelete || !!onEdit} 
            
            isOpen={openMenuId === memory._id}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === memory._id ? null : memory._id);
            }}
            
            // Pass functions safely
            onDelete={onDelete ? () => onDelete(memory._id) : null}
            onEdit={onEdit ? () => onEdit(memory._id) : null}
            
            isOwner={isOwner}
          />
        ))}
      </div>
    );
  }

  // Feed Layout
  const grouped = memories.reduce((acc, item) => {
    const dateKey = formatDate(item.date || item.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-12 pb-20 p-5 animate-fadeIn">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-xl font-bold text-gray-800 mb-4 sticky top-20 z-10 bg-gray-50/95 backdrop-blur py-2 w-max px-4 rounded-full shadow-sm border border-gray-100">
            {date}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped[date].map((memory) => (
              <MemoryCard key={memory._id} memory={memory} navigate={navigate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 🟢 Sub-Component: MemoryThumbnail (Updated Logic)
const MemoryThumbnail = ({ memory, navigate, showMenu, isOpen, onToggleMenu, onDelete, onEdit, isOwner }) => (
  <div 
    onClick={() => navigate(`/stories/${memory._id}`)} 
    className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    {memory.media?.[0]?.url ? (
       <img src={memory.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
    ) : (
       <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><FiImage size={32}/></div>
    )}
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
       {!isOwner && (
         <span className="self-start text-[10px] bg-purple-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">Tagged In</span>
       )}
    </div>

    {/* 🟢 SHOW MENU ONLY IF ACTIONS EXIST */}
    {showMenu && (
      <div className="absolute top-2 right-2">
        <button 
          onClick={onToggleMenu}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${isOpen ? 'bg-white text-gray-800 shadow-md' : 'bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100'}`}
        >
          <FiMoreVertical size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl py-1.5 z-20 border border-gray-100 animate-fadeIn origin-top-right">
            
            {/* Show Edit only if passed */}
            {onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-3">
                <FiEdit2 size={14}/> Edit Story
              </button>
            )}

            {/* Show Divider only if BOTH exist */}
            {onEdit && onDelete && <div className="h-px bg-gray-100 my-0.5"></div>}

            {/* Show Delete only if passed */}
            {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3">
                <FiTrash2 size={14}/> Delete
              </button>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);

// Sub-Component: Feed Card
const MemoryCard = ({ memory, navigate }) => {
  const mediaItem = memory.media && memory.media[0] ? memory.media[0] : null;
  if (!mediaItem) return null;
  const isVideo = mediaItem.mimeType?.startsWith("video");

  return (
    <div 
      onClick={() => navigate(`/stories/${memory._id}`)}
      className="group relative rounded-2xl overflow-hidden shadow-sm bg-gray-200 hover:shadow-lg transition-all duration-300 aspect-[4/3] cursor-pointer"
    >
      {isVideo ? (
        <video src={mediaItem.url} className="w-full h-full object-cover" muted />
      ) : (
        <img src={mediaItem.url} alt="memory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-4">
        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <p className="text-sm font-semibold truncate">{memory.description || memory.title || "Untitled"}</p>
          <p className="text-xs opacity-80">Uploaded by {memory.author?.username || "Family Member"}</p>
        </div>
      </div>
    </div>
  );
};