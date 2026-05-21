import React, { useState, useEffect } from "react";
import { FiPackage } from "react-icons/fi";
import { api } from "../services/useAuth"; 
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal"; 
import TimeCapsuleCreate from "./TimeCapsuleCreate";
import TimeCapsuleList from "./TimeCapsuleList";

export default function TimeCapsule() {
  const [activeTab, setActiveTab] = useState("create"); 
  const [loading, setLoading] = useState(false);
  const [capsules, setCapsules] = useState([]);
  const [toast, setToast] = useState(null);

  // 🟢 Modal State
  const [modal, setModal] = useState({
     isOpen: false,
     id: null,
     type: null, // 'locked' | 'unlocked' | 'deleted'
     message: "",
     title: ""
  });

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        setLoading(true);
        const res = await api.get("/scheduled-messages"); 
        setCapsules(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "list") fetchCapsules();
  }, [activeTab]);

  // 🟢 1. INITIATE DELETE (Opens Your Modal)
  const initiateDelete = (id, type) => {
    let title = "Confirm Action";
    let msg = "";
    
    if (type === 'locked') {
        title = "Destroy Time Capsule?";
        msg = "Are you sure? This will destroy the capsule forever. This action cannot be undone.";
    } else if (type === 'unlocked') {
        title = "Remove from List?";
        msg = "This will remove this log from your list. The story in the family feed will REMAIN safe.";
    } else if (type === 'deleted') {
        title = "Clear Notification?";
        msg = "This will remove this 'Deleted' notification from your list.";
    }

    setModal({
        isOpen: true,
        id,
        type,
        title,
        message: msg
    });
  };

  // 🟢 2. CONFIRM DELETE (Actual API Call)
  const confirmDelete = async () => {
    try {
      await api.delete(`/scheduled-messages/${modal.id}`);
      setCapsules(prev => prev.filter(c => c._id !== modal.id));
      setToast({message: "Removed successfully", type: "success"});
    } catch (err) {
      setToast({message: "Could not delete", type: "error"});
    } finally {
      // Close Modal
      setModal({ ...modal, isOpen: false });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* 🟢 RENDER YOUR EXISTING MODAL */}
      <ConfirmModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={confirmDelete}
      />

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 animate-fadeIn">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl shadow-sm">
          <FiPackage size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Capsule</h1>
          <p className="text-gray-500">Send memories to the future</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b border-gray-100 mb-8">
        <button 
          onClick={() => setActiveTab("create")} 
          className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === "create" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"}`}
        >
          Bury New Capsule
          {activeTab === "create" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab("list")} 
          className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === "list" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"}`}
        >
          My Pending Capsules
          {activeTab === "list" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full"></span>}
        </button>
      </div>

      {activeTab === "create" && (
         <TimeCapsuleCreate onCreated={() => setActiveTab("list")} setToast={setToast} />
      )}

      {activeTab === "list" && (
         <TimeCapsuleList capsules={capsules} loading={loading} initiateDelete={initiateDelete} />
      )}
    </div>
  );
}