import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiUsers, FiEdit3, FiSave, FiX, FiClock } from "react-icons/fi";
import { api } from "../services/useAuth"; 

// 🟢 Components
import Toast from "../components/ui/Toast";
import HistoryModal from "../components/ui/HistoryModal";

export default function StoryView({ initialEditMode = false }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // Data State
  const [memory, setMemory] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null); // To check ownership

  // UI State
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Edit Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: ""
  });

  useEffect(() => {
    fetchMemory();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setCurrentUserId(res.data.user._id);
    } catch(err) {}
  };

  const fetchMemory = async () => {
    try {
      const res = await api.get(`/memories/detail/${id}`);
      setMemory(res.data);
      // Pre-fill form
      setFormData({
        title: res.data.title,
        description: res.data.description,
        date: res.data.date ? res.data.date.split('T')[0] : ""
      });
    } catch (err) {
      console.error("Failed to load story", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/memories/${id}/versions`);
      setVersions(res.data);
      setShowHistory(true);
    } catch (err) {
      setToast({ message: "Could not load history", type: "error" });
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/memories/${id}`, formData);
      setMemory(res.data); // Update view with new data
      setIsEditing(false);
      setToast({ message: "Story updated & version saved!", type: "success" });
    } catch (err) {
      setToast({ message: "Update failed", type: "error" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading story...</div>;
  if (!memory) return <div className="h-screen flex items-center justify-center text-gray-500">Story not found.</div>;

  const isOwner = currentUserId === memory.author?._id;
  
  // Helper for video
  const isVideo = (mediaItem) => {
    if (mediaItem.mimeType) return mediaItem.mimeType.startsWith("video");
    return mediaItem.url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen pb-20 animate-fadeIn relative">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {showHistory && <HistoryModal versions={versions} onClose={() => setShowHistory(false)} />}

      {/* 1. HEADER */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600">
            <FiArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <img src={memory.author?.avatarUrl || "https://via.placeholder.com/150"} alt="" className="w-10 h-10 rounded-full border border-gray-200"/>
            <div>
               <h1 className="text-sm font-bold text-gray-800">{memory.author?.username}</h1>
               <p className="text-xs text-gray-500">
                 {new Date(memory.date).toLocaleDateString()}
               </p>
            </div>
          </div>
        </div>

        {/* 🟢 EDIT CONTROLS (Only for Owner) */}
        {isOwner && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
                <button 
                  onClick={handleUpdate}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  <FiSave /> Save
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={fetchVersions} 
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="View Edit History"
                >
                  <FiClock size={20} />
                </button>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit Story"
                >
                  <FiEdit3 size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. MEDIA GALLERY (Same as before) */}
      <div className="relative bg-black aspect-video md:aspect-[16/9] flex items-center justify-center overflow-hidden">
        {memory.media && memory.media.length > 0 ? (
           <>
             {isVideo(memory.media[activeMediaIndex]) ? (
                <video src={memory.media[activeMediaIndex].url} controls className="w-full h-full object-contain" />
             ) : (
                <img src={memory.media[activeMediaIndex].url} alt="Memory" className="w-full h-full object-contain"/>
             )}
             {/* Carousel Dots */}
             {memory.media.length > 1 && (
               <div className="absolute bottom-4 flex justify-center gap-2 z-10">
                 {memory.media.map((_, idx) => (
                   <button key={idx} onClick={() => setActiveMediaIndex(idx)} className={`w-2 h-2 rounded-full ${idx === activeMediaIndex ? "bg-white" : "bg-white/40"}`}/>
                 ))}
               </div>
             )}
           </>
        ) : (
          <div className="text-gray-500 text-sm">No media attached</div>
        )}
      </div>

      {/* 3. DETAILS SECTION (View vs Edit Mode) */}
      <div className="p-5 space-y-6">
        
        {/* 🟢 TITLE & DESCRIPTION */}
        <div>
          {isEditing ? (
            <div className="space-y-4 animate-fadeIn">
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full text-2xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1 placeholder-gray-300"
                placeholder="Story Title"
              />
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full min-h-[150px] p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                placeholder="Write your story..."
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">{memory.title || "Untitled Memory"}</h2>
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{memory.description}</p>
            </>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* 🟢 METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tagged (Read Only for now) */}
          {memory.taggedPersons && memory.taggedPersons.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl">
              <div className="p-2 bg-white text-indigo-600 rounded-full shadow-sm"><FiUsers size={18} /></div>
              <div>
                <p className="text-xs text-indigo-400 uppercase tracking-wide font-bold mb-1">With</p>
                <div className="flex flex-wrap gap-2">
                  {memory.taggedPersons.map(p => (
                    <span key={p._id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white text-gray-700 shadow-sm">{p.name}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date (Editable) */}
          <div className={`flex items-start gap-3 p-3 rounded-xl ${isEditing ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
             <div className="p-2 bg-white text-gray-500 rounded-full shadow-sm"><FiCalendar size={18} /></div>
             <div className="w-full">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Date</p>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="bg-transparent w-full text-sm font-medium focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(memory.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}