import React from "react";
import { FiImage, FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

// Sub-component: Individual Thumbnail
const MemoryThumbnail = ({ memory, canEdit, onClick, isOpen, onToggleMenu, onDelete, onEdit }) => (
  <div onClick={onClick} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    
    {memory.media?.[0]?.url ? (
       <img src={memory.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
    ) : (
       <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><FiImage size={32}/></div>
    )}
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
       {!canEdit && (
         <span className="self-start text-[10px] bg-purple-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">Tagged In</span>
       )}
    </div>

    {/* 3 Dots Menu */}
    {canEdit && (
      <div className="absolute top-2 right-2">
        <button 
          onClick={onToggleMenu}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${isOpen ? 'bg-white text-gray-800 shadow-md' : 'bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100'}`}
        >
          <FiMoreVertical size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl py-1.5 z-20 border border-gray-100 animate-fadeIn origin-top-right">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
            >
              <FiEdit2 size={14}/> Edit Story
            </button>
            <div className="h-px bg-gray-100 my-0.5"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <FiTrash2 size={14}/> Delete
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

// Main Component
export default function MemoryGrid({ 
  activeTab, 
  setActiveTab, 
  memories, 
  navigate, 
  openMenuId, 
  setOpenMenuId, 
  handleDeleteMemory, 
  handleEditMemory 
}) {
  const currentMemories = activeTab === "uploads" ? memories.myUploads : memories.taggedIn;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab("uploads")}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === "uploads" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          My Stories <span className="ml-1 text-xs opacity-70 bg-gray-100 px-1.5 py-0.5 rounded-full">{memories.myUploads.length}</span>
          {activeTab === "uploads" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"/>}
        </button>
        
        <button 
          onClick={() => setActiveTab("tagged")}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === "tagged" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Tagged In <span className="ml-1 text-xs opacity-70 bg-gray-100 px-1.5 py-0.5 rounded-full">{memories.taggedIn.length}</span>
          {activeTab === "tagged" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"/>}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {currentMemories.map(mem => (
          <MemoryThumbnail 
            key={mem._id} 
            memory={mem} 
            canEdit={activeTab === "uploads"} 
            onClick={() => navigate(`/stories/${mem._id}`)}
            
            isOpen={openMenuId === mem._id}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === mem._id ? null : mem._id);
            }}
            onDelete={() => handleDeleteMemory(mem._id)}
            onEdit={() => handleEditMemory(mem._id)}
          />
        ))}
        
        {currentMemories.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <FiImage className="mx-auto text-4xl mb-3 opacity-30"/>
            <p className="font-medium">No memories found here yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}