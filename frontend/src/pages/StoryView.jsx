import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";
import { api } from "../services/useAuth"; 

export default function StoryView() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const res = await api.get(`/memories/detail/${id}`);
        setMemory(res.data);
      } catch (err) {
        console.error("Failed to load story", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemory();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading story...</div>;
  if (!memory) return <div className="h-screen flex items-center justify-center text-gray-500">Story not found.</div>;

  const isVideo = (mediaItem) => {
    if (mediaItem.mimeType) return mediaItem.mimeType.startsWith("video");
    return mediaItem.url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  // 🟢 Handle Author Click
  const handleAuthorClick = () => {
    if (memory.author?._id) {
      // Navigate to profile page (Adjust route to match your Profile route)
      navigate(`/profile/${memory.author._id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen pb-20 animate-fadeIn relative">
      
      {/* 1. HEADER (Author & Navigation) */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <FiArrowLeft size={24} />
          </button>
          
          {/* 🟢 Clickable User Profile Section */}
          <div 
            onClick={handleAuthorClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
              <img 
                src={memory.author?.avatarUrl || "https://via.placeholder.com/150"} 
                alt={memory.author?.username} 
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
            </div>
            
            {/* User Info */}
            <div>
               <h1 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                 {memory.author?.username || "Unknown User"}
               </h1>
               <p className="text-xs text-gray-500">
                 {/* Format: "Oct 24, 2025" */}
                 {new Date(memory.date).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                 })}
               </p>
            </div>
          </div>
        </div>

        {/* Optional: Options Menu (3 dots) could go here */}
      </div>

      {/* 2. MEDIA GALLERY */}
      <div className="relative bg-black aspect-video md:aspect-[16/9] flex items-center justify-center overflow-hidden group">
        {memory.media && memory.media.length > 0 ? (
           <>
             {isVideo(memory.media[activeMediaIndex]) ? (
                <video 
                  src={memory.media[activeMediaIndex].url} 
                  controls 
                  className="w-full h-full object-contain" 
                />
             ) : (
                <img 
                  src={memory.media[activeMediaIndex].url} 
                  alt="Memory" 
                  className="w-full h-full object-contain"
                />
             )}
             
             {/* Dots Navigation */}
             {memory.media.length > 1 && (
               <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10">
                 {memory.media.map((_, idx) => (
                   <button 
                     key={idx}
                     onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx); }}
                     className={`w-2 h-2 rounded-full shadow-sm transition-all ${
                       idx === activeMediaIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/80"
                     }`}
                   />
                 ))}
               </div>
             )}
           </>
        ) : (
          <div className="text-gray-500 text-sm">No media attached</div>
        )}
      </div>

      {/* 3. DETAILS SECTION */}
      <div className="p-5 space-y-6">
        
        {/* Title & Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
            {memory.title || "Untitled Memory"}
          </h2>
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {memory.description}
          </p>
        </div>

        <hr className="border-gray-100" />

        {/* Metadata Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tagged People */}
          {memory.taggedPersons && memory.taggedPersons.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl">
              <div className="p-2 bg-white text-indigo-600 rounded-full shadow-sm">
                <FiUsers size={18} />
              </div>
              <div>
                <p className="text-xs text-indigo-400 uppercase tracking-wide font-bold mb-1">With</p>
                <div className="flex flex-wrap gap-2">
                  {memory.taggedPersons.map(person => (
                    <span 
                      key={person._id} 
                      // If you want these clickable too, add onClick here
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white text-gray-700 border border-indigo-100 shadow-sm"
                    >
                      {/* Optional: Small Avatar for tagged person */}
                      {person.avatarUrl && (
                        <img src={person.avatarUrl} alt="" className="w-3 h-3 rounded-full" />
                      )}
                      {person.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date / Location Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
             <div className="p-2 bg-white text-gray-500 rounded-full shadow-sm">
                <FiCalendar size={18} />
             </div>
             <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Date</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(memory.date).toLocaleDateString(undefined, { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}