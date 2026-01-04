import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/useAuth";

// Components
import SettingsModal from "../components/SettingsModal";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import ProfileHeader from "../components/profile/ProfileHeader";
import UserInfoCard from "../components/profile/UserInfoCard";
import MemoriesFeed from "../components/MemoriesFeed";

export default function Profile() {
  const navigate = useNavigate();
  
  // State
  const [user, setUser] = useState(null);
  const [memories, setMemories] = useState({ myUploads: [], taggedIn: [] });
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("uploads");
  const [showSettings, setShowSettings] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); 
  
  const [toast, setToast] = useState(null); 
  const [deleteTargetId, setDeleteTargetId] = useState(null); 

  const [formData, setFormData] = useState({
    username: "", bio: "", gender: "", dob: "", avatar: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchProfileData();
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Handlers
  const fetchProfileData = async () => {
    try {
      const [profileRes, memoryRes] = await Promise.all([
        api.get("/users/profile"),
        api.get("/users/memories")
      ]);
      setUser(profileRes.data);
      setMemories(memoryRes.data);
      setFormData({
        username: profileRes.data.username || "",
        bio: profileRes.data.primaryPerson?.bio || "",
        gender: profileRes.data.primaryPerson?.gender || "male",
        dob: profileRes.data.primaryPerson?.dob ? profileRes.data.primaryPerson.dob.split('T')[0] : "",
        avatar: null
      });
    } catch (err) {
      setToast({ message: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSaveProfile = async () => {
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      data.append("gender", formData.gender);
      data.append("dob", formData.dob);
      if (formData.avatar) data.append("avatar", formData.avatar);

      const res = await api.put("/users/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(res.data);
      setIsEditing(false);
      setPreviewUrl(null);
      setToast({ message: "Profile updated!", type: "success" });
    } catch (err) {
      setToast({ message: "Update failed.", type: "error" });
    }
  };

  const handleLogout = async () => {
    await api.post("/auth/logout");
    navigate("/login");
  };

  // Delete Logic
  const promptDelete = (memoryId) => setDeleteTargetId(memoryId);

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/memories/${deleteTargetId}`);
      setMemories(prev => ({
        ...prev,
        myUploads: prev.myUploads.filter(m => m._id !== deleteTargetId)
      }));
      setToast({ message: "Memory deleted.", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete.";
      setToast({ message: msg, type: "error" });
    } finally {
      setDeleteTargetId(null); 
    }
  };

  // Navigate to edit page (make sure your Router handles /stories/:id/edit)
  const handleEditMemory = (memoryId) => navigate(`/stories/${memoryId}`); 

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fadeIn relative min-h-screen bg-gray-50/50">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDelete}
        title="Delete Memory?"
        message="Are you sure? This cannot be undone."
      />

      {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} onLogout={handleLogout}/>}

      <ProfileHeader 
        user={user}
        previewUrl={previewUrl}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSave={handleSaveProfile}
        handleImageChange={handleImageChange}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
           <UserInfoCard user={user} isEditing={isEditing} formData={formData} setFormData={setFormData} />
        </div>

        <div className="md:col-span-2">
           <div className="flex gap-8 border-b border-gray-200 mb-6">
             <button onClick={() => setActiveTab("uploads")} className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "uploads" ? "text-blue-600" : "text-gray-400"}`}>
               My Stories
               {activeTab === "uploads" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"/>}
             </button>
             <button onClick={() => setActiveTab("tagged")} className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "tagged" ? "text-blue-600" : "text-gray-400"}`}>
               Tagged In
               {activeTab === "tagged" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"/>}
             </button>
           </div>

           <MemoriesFeed 
             layout="grid" 
             memories={activeTab === "uploads" ? memories.myUploads : memories.taggedIn}
             isOwner={activeTab === "uploads"} 
             openMenuId={openMenuId}
             setOpenMenuId={setOpenMenuId}
             
             // 🟢 1. DELETE: Only if I am the owner (My Stories tab)
             onDelete={activeTab === "uploads" ? promptDelete : null}
             
             // 🟢 2. EDIT: ALWAYS allowed (My Stories OR Tagged In)
             onEdit={handleEditMemory}
           />
        </div>
      </div>
    </div>
  );
}