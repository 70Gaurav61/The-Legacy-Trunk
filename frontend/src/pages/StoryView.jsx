import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, FiCalendar, FiUsers, FiEdit3, FiSave, FiX, 
  FiClock, FiPlus, FiMoreVertical, FiTrash2, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import { api } from "../services/useAuth"; 

// Components
import Toast from "../components/ui/Toast";
import HistoryModal from "../components/ui/HistoryModal";
import ConfirmModal from "../components/ui/ConfirmModal"; 

export default function StoryView({ initialEditMode = false }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // Data State
  const [memory, setMemory] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [familyMembers, setFamilyMembers] = useState([]); 

  // UI State
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showAddTag, setShowAddTag] = useState(false); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUntagConfirm, setShowUntagConfirm] = useState(false); 

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    taggedPersons: [] 
  });

  // 🟢 Navigation Logic
  const nextMedia = useCallback(() => {
    if (!memory?.media) return;
    setActiveMediaIndex((prev) => (prev + 1) % memory.media.length);
  }, [memory]);

  const prevMedia = useCallback(() => {
    if (!memory?.media) return;
    setActiveMediaIndex((prev) => (prev - 1 + memory.media.length) % memory.media.length);
  }, [memory]);

  // Handle Keyboard Arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditing) return;
      if (e.key === "ArrowLeft") prevMedia();
      if (e.key === "ArrowRight") nextMedia();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevMedia, nextMedia, isEditing]);

  useEffect(() => {
    fetchMemory();
    fetchCurrentUser();
    const handleClickOutside = () => setMenuOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [id]);

  useEffect(() => {
    if (isEditing && memory && currentUserId === memory.author?._id) {
       fetchFamilyMembers();
    }
  }, [isEditing, memory, currentUserId]);

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
      setFormData({
        title: res.data.title || "",
        description: res.data.description || "",
        date: res.data.date ? res.data.date.split('T')[0] : "",
        taggedPersons: res.data.taggedPersons || []
      });
    } catch (err) {
      setToast({ message: "Story not found", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const familyId = typeof memory.family === 'object' ? memory.family._id : memory.family;
      const res = await api.get(`/persons/${familyId}`); 
      setFamilyMembers(res.data);
    } catch (err) {
      console.log("Could not fetch family members");
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
      const payload = {
          ...formData,
          taggedPersons: formData.taggedPersons.map(p => p._id)
      };
      const res = await api.put(`/memories/${id}`, payload);
      setMemory(res.data); 
      setIsEditing(false);
      setToast({ message: "Story updated!", type: "success" });
    } catch (err) {
      setToast({ message: "Update failed", type: "error" });
    }
  };

  const handleRemoveTag = (personId) => {
     setFormData(prev => ({
         ...prev,
         taggedPersons: prev.taggedPersons.filter(p => p._id !== personId)
     }));
  };

  const promptSelfUntag = () => {
    setMenuOpen(false);
    setShowUntagConfirm(true);
  };

  const executeSelfUntag = async () => {
    try {
      const myTag = memory.taggedPersons.find(p => (p.user?._id === currentUserId) || (p.user === currentUserId));
      if (!myTag) return;
      const newTagsIds = memory.taggedPersons.filter(p => p._id !== myTag._id).map(p => p._id);
      await api.put(`/memories/${id}`, { ...formData, taggedPersons: newTagsIds });
      navigate(-1);
    } catch (err) {
      setToast({ message: "Failed to remove tag", type: "error" });
    }
  };

  const handleAddTag = (e) => {
     const personId = e.target.value;
     if (!personId) return;
     const personToAdd = familyMembers.find(m => m._id === personId);
     if (personToAdd && !formData.taggedPersons.some(p => p._id === personId)) {
         setFormData(prev => ({ ...prev, taggedPersons: [...prev.taggedPersons, personToAdd] }));
     }
     setShowAddTag(false);
  };

  const isVideo = (mediaItem) => {
    if (!mediaItem) return false;
    if (mediaItem.mimeType) return mediaItem.mimeType.startsWith("video");
    return mediaItem.url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading story...</div>;
  if (!memory) return <div className="h-screen flex items-center justify-center text-gray-500">Story not found.</div>;

  const isOwner = currentUserId === memory.author?._id;
  const isTagged = memory.taggedPersons?.some(p => (p.user?._id === currentUserId) || (p.user === currentUserId));
  const canEdit = isOwner || isTagged;

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen pb-20 animate-fadeIn relative shadow-xl my-4 rounded-xl overflow-hidden">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmModal 
        isOpen={showUntagConfirm}
        onClose={() => setShowUntagConfirm(false)}
        onConfirm={executeSelfUntag}
        title="Remove Tag?"
        message="Are you sure you want to remove yourself from this memory?"
      />

      {showHistory && <HistoryModal versions={versions} onClose={() => setShowHistory(false)} />}

      {/* HEADER */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <FiArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${memory.author?._id}`)}>
            <img 
              src={memory.author?.avatarUrl || `https://ui-avatars.com/api/?name=${memory.author?.username || 'User'}&background=random`} 
              alt="" className="w-10 h-10 rounded-full border border-gray-200"
            />
            <div>
               <h1 className="text-sm font-bold text-gray-800 hover:underline">{memory.author?.username || "Unknown Author"}</h1>
               <p className="text-xs text-gray-500">{new Date(memory.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><FiX size={20}/></button>
                <button onClick={handleUpdate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  <FiSave /> Save
                </button>
              </>
            ) : (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <FiMoreVertical size={20} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-1.5 z-50 border border-gray-100 animate-fadeIn origin-top-right">
                    <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <FiEdit3 className="text-blue-500" size={16}/> Edit Story
                    </button>
                    {isOwner && (
                      <button onClick={() => { fetchVersions(); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                        <FiClock className="text-orange-500" size={16}/> View History
                      </button>
                    )}
                    {!isOwner && isTagged && (
                      <button onClick={promptSelfUntag} className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3">
                        <FiTrash2 size={16}/> Remove Tag
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🟢 UPDATED MEDIA GALLERY WITH ARROWS */}
      <div className="relative bg-black aspect-video md:aspect-[16/9] flex items-center justify-center overflow-hidden group">
        {memory.media && memory.media.length > 0 ? (
           <>
             {/* Main Content */}
             {isVideo(memory.media[activeMediaIndex]) ? (
                <video 
                  key={memory.media[activeMediaIndex].url}
                  src={memory.media[activeMediaIndex].url} 
                  controls 
                  className="w-full h-full object-contain" 
                />
             ) : (
                <img 
                  src={memory.media[activeMediaIndex].url} 
                  alt="Memory" 
                  className="w-full h-full object-contain select-none"
                />
             )}

             {/* Navigation Arrows (Visible on hover) */}
             {memory.media.length > 1 && (
               <>
                 <button 
                   onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                   className="absolute left-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                 >
                   <FiChevronLeft size={32} />
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                   className="absolute right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                 >
                   <FiChevronRight size={32} />
                 </button>

                 {/* Pagination Dots */}
                 <div className="absolute bottom-4 flex justify-center gap-2 z-10 w-full">
                   {memory.media.map((_, idx) => (
                     <button 
                       key={idx} 
                       onClick={() => setActiveMediaIndex(idx)} 
                       className={`w-2 h-2 rounded-full transition-all ${idx === activeMediaIndex ? "bg-white scale-125" : "bg-white/40"}`}
                     />
                   ))}
                 </div>

                 {/* Index Badge */}
                 <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 text-white text-[10px] rounded-md backdrop-blur-sm">
                   {activeMediaIndex + 1} / {memory.media.length}
                 </div>
               </>
             )}
           </>
        ) : (
          <div className="text-gray-500 text-sm">No media attached</div>
        )}
      </div>

      {/* DETAILS SECTION */}
      <div className="p-6 space-y-8">
        <div>
          {isEditing ? (
            <div className="space-y-4 animate-fadeIn">
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full text-2xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 transition-colors" placeholder="Story Title"/>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full min-h-[150px] p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Write your story..."/>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">{memory.title || "Untitled Memory"}</h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{memory.description}</p>
            </>
          )}
        </div>

        <hr className="border-gray-100" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(isEditing || (memory.taggedPersons && memory.taggedPersons.length > 0)) && (
            <div className="flex items-start gap-4 p-4 bg-indigo-50/50 rounded-2xl">
              <div className="p-2.5 bg-white text-indigo-600 rounded-full shadow-sm"><FiUsers size={20} /></div>
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs text-indigo-400 uppercase tracking-wide font-bold">With</p>
                   {isEditing && isOwner && (
                     <div className="relative">
                        <button onClick={() => setShowAddTag(!showAddTag)} className="text-xs flex items-center gap-1 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors">
                           <FiPlus/> Add
                        </button>
                        {showAddTag && (
                            <select 
                                onChange={handleAddTag}
                                className="absolute right-0 top-8 w-48 bg-white border border-gray-200 shadow-lg rounded-md p-2 text-sm z-50 focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled>Select Person...</option>
                                {familyMembers.map(m => (
                                    <option key={m._id} value={m._id}>{m.name}</option>
                                ))}
                            </select>
                        )}
                     </div>
                   )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(isEditing ? formData.taggedPersons : memory.taggedPersons).map((p, index) => {
                    const canRemove = isEditing && (isOwner || (p.user?._id === currentUserId) || (p.user === currentUserId));
                    return (
                        <span key={p._id || index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 shadow-sm border border-indigo-100">
                        {p.name || "Unknown"}
                        {canRemove && (
                            <button onClick={() => handleRemoveTag(p._id)} className="ml-1 p-0.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                                <FiX size={12}/>
                            </button>
                        )}
                        </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${isEditing ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
             <div className="p-2.5 bg-white text-gray-500 rounded-full shadow-sm"><FiCalendar size={20} /></div>
             <div className="w-full">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-2">Date Occurred</p>
                {isEditing ? (
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="bg-transparent w-full text-sm font-medium focus:outline-none p-1 border-b border-blue-200"/>
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