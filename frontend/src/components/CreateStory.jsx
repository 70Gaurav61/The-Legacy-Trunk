import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiCalendar, FiLock, FiType, FiEye } from "react-icons/fi";
import { api } from "../services/useAuth";
import Toast from "../components/ui/Toast";
import MediaUploader from "./MediaUploader";

const useCurrentFamily = () => {
    const [familyId, setFamilyId] = useState(null);
    useEffect(() => {
        api.get("/auth/me").then(res => {
            if(res.data.user.families.length > 0) {
                setFamilyId(res.data.user.families[0]);
            }
        });
    }, []);
    return familyId;
};

export default function CreateStory() {
  const navigate = useNavigate();
  const familyId = useCurrentFamily();
  
  // 🟢 Updated: Changed to arrays for multi-upload
  const [files, setFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [visibility, setVisibility] = useState("family");
  const [sharedWith, setSharedWith] = useState([]); 
  
  const [familyMembers, setFamilyMembers] = useState([]); 
  const [selectedTags, setSelectedTags] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("/persons");
        setFamilyMembers(res.data);
      } catch (err) {
        console.error("Failed to load family members", err);
      }
    };
    fetchMembers();
  }, []);

  const toggleTag = (personId) => {
    if (selectedTags.includes(personId)) {
      setSelectedTags(selectedTags.filter(id => id !== personId));
    } else {
      setSelectedTags([...selectedTags, personId]);
    }
  };

  const toggleShare = (userId) => {
    if (sharedWith.includes(userId)) {
      setSharedWith(sharedWith.filter(id => id !== userId));
    } else {
      setSharedWith([...sharedWith, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!familyId) return setToast({message: "Family ID not found. Please refresh.", type: "error"});
    if (files.length === 0 && !description) return setToast({message: "Please add a photo or a story text.", type: "error"});

    if (visibility === 'selected' && sharedWith.length === 0) {
        return setToast({message: "Please select at least one person to share with.", type: "error"});
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("visibility", visibility);
    
    selectedTags.forEach(id => formData.append("taggedPersons[]", id));

    if (visibility === 'selected') {
        sharedWith.forEach(id => formData.append("sharedWith[]", id));
    }

    // 🟢 Updated: Loop through files to append to 'media' field
    if (files.length > 0) {
      files.forEach(f => formData.append("media", f));
      
      // Use the first file to determine general mediaType
      const type = files[0].type.startsWith("video") ? "video" : "photo";
      formData.append("mediaType", type);
    } else {
      formData.append("mediaType", "story");
    }

    try {
      await api.post(`/memories/${familyId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err) {
      console.error("Upload failed", err);
      setToast({message: "Failed to post story. Please try again.", type: "error"});
    } finally {
      setLoading(false);
    }
  };

  const availableForSharing = familyMembers.filter(p => p.user !== null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Create a Story</h1>
        <p className="text-gray-500">Share memories with your family. (Up to 5 files)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MediaUploader files={files} setFiles={setFiles} previews={previews} setPreviews={setPreviews} maxFiles={5} setToast={setToast} />
          
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
            <div className="flex items-start gap-3">
              <FiType className="text-gray-400 mt-1" size={20} />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the story?" className="w-full h-24 resize-none outline-none text-gray-700 placeholder-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3"><FiUsers /> Tag People</label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
              {familyMembers.map(person => (
                <button key={person._id} type="button" onClick={() => toggleTag(person._id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTags.includes(person._id) ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  <img src={person.avatarUrl || `https://ui-avatars.com/api/?name=${person.name}`} alt={person.name} className="w-5 h-5 rounded-full bg-gray-300" />{person.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Vacation" className="w-full border-b border-gray-200 py-2 outline-none focus:border-indigo-500 transition-colors" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><FiCalendar /> Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><FiLock /> Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="family">Whole Family</option>
                <option value="selected">Specific People</option>
                <option value="private">Private (Only Me)</option>
              </select>
            </div>

            {visibility === 'selected' && (
               <div className="pt-2 border-t border-gray-100 animate-fadeIn">
                 <label className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2"><FiEye /> Who can see this?</label>
                 <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                   {availableForSharing.length === 0 ? (
                       <p className="text-xs text-gray-400 italic">No other family members joined yet.</p>
                   ) : (
                       availableForSharing.map(person => (
                         <div key={person.user} onClick={() => toggleShare(person.user)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                           <div className={`w-4 h-4 rounded border flex items-center justify-center ${sharedWith.includes(person.user) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                             {sharedWith.includes(person.user) && <div className="w-2 h-2 bg-white rounded-sm" />}
                           </div>
                           <div className="flex items-center gap-2">
                             <img src={person.avatarUrl || `https://ui-avatars.com/api/?name=${person.name}`} className="w-6 h-6 rounded-full" alt="" />
                             <span className="text-sm text-gray-700">{person.name}</span>
                           </div>
                         </div>
                       ))
                   )}
                 </div>
               </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>{loading ? "Uploading..." : "Post Story"}</button>
        </div>
      </div>
    </div>
  );
}