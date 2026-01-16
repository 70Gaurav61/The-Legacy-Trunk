import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  FiClock, FiCalendar, FiFile, FiTrash2, FiPackage, FiLock, FiUnlock, FiLoader, FiCheckCircle, FiArrowRight 
} from "react-icons/fi";
import { api } from "../services/useAuth"; 
import Toast from "../components/ui/Toast";

export default function TimeCapsule() {
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'list'
  const [loading, setLoading] = useState(false);
  const [capsules, setCapsules] = useState([]);
  const [toast, setToast] = useState(null);

  // Form State
  const [content, setContent] = useState("");
  const [deliverAt, setDeliverAt] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (activeTab === "list") fetchCapsules();
  }, [activeTab]);

  const fetchCapsules = async () => {
    try {
      setLoading(true);
      // 🟢 FIX: Route matches your request
      const res = await api.get("/scheduled-messages"); 
      setCapsules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && files.length === 0) return setToast({message: "Add a message or file", type: "error"});
    if (!deliverAt) return setToast({message: "Select a future date", type: "error"});

    if (new Date(deliverAt) <= new Date()) {
        return setToast({message: "Date must be in the future!", type: "error"});
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("content", content);
      formData.append("deliverAt", deliverAt);
      
      Array.from(files).forEach((file) => {
        formData.append("attachments", file);
      });

      // 🟢 FIX: Route matches your request
      await api.post("/scheduled-messages", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setToast({message: "Time capsule scheduled successfully!", type: "success"});
      setContent("");
      setFiles([]);
      setDeliverAt("");
      setActiveTab("list"); 
    } catch (err) {
      setToast({message: err.response?.data?.message || "Failed to schedule", type: "error"});
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to destroy this time capsule? It will be lost forever.")) return;
    try {
      // 🟢 FIX: Route matches your request
      await api.delete(`/scheduled-messages/${id}`);
      setCapsules(capsules.filter(c => c._id !== id));
      setToast({message: "Capsule destroyed", type: "success"});
    } catch (err) {
      setToast({message: "Could not delete", type: "error"});
    }
  };

  const getTimeRemaining = (dateString) => {
    const total = Date.parse(dateString) - Date.parse(new Date());
    if (total <= 0) return "Visit Home Feed to Open"; 
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 365) return `${Math.floor(days/365)} years left`;
    if (days > 0) return `${days} days left`;
    return "Less than 24h left";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
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

      {/* --- CREATE FORM --- */}
      {activeTab === "create" && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-slideUp">
           <form onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">When should this open?</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                   <FiCalendar size={20}/>
                 </div>
                 <input 
                   type="datetime-local" 
                   className="w-full pl-12 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                   value={deliverAt}
                   onChange={(e) => setDeliverAt(e.target.value)}
                   min={new Date().toISOString().slice(0, 16)}
                 />
               </div>
               <p className="text-xs text-orange-500 mt-2 font-medium flex items-center gap-1">
                 <FiLock size={10}/> This will remain locked until the chosen date.
               </p>
             </div>

             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Message to the future</label>
               <textarea 
                 className="w-full p-4 border border-gray-200 rounded-xl min-h-[150px] focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all resize-none bg-gray-50 focus:bg-white"
                 placeholder="Write a prediction, a wish, or a story for your future self..."
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Add Photos/Videos</label>
               <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-orange-50 hover:border-orange-200 transition cursor-pointer relative group">
                 <input 
                    type="file" 
                    multiple 
                    onChange={(e) => setFiles(e.target.files)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div className="bg-orange-100 text-orange-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FiFile size={20}/>
                 </div>
                 <span className="text-sm font-bold text-gray-600 block group-hover:text-orange-600">
                   {files.length > 0 ? `${files.length} files attached` : "Click to upload media"}
                 </span>
                 <span className="text-xs text-gray-400 mt-1 block">Up to 5 files allowed</span>
               </div>
             </div>

             <button 
               type="submit" 
               disabled={loading} 
               className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl shadow-gray-200 active:scale-[0.98]"
             >
               {loading ? <FiLoader className="animate-spin" /> : <><FiClock/> Seal Time Capsule</>}
             </button>
           </form>
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {activeTab === "list" && (
        <div className="grid gap-4 animate-fadeIn">
          {capsules.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FiClock className="text-gray-300" size={32}/>
              </div>
              <h3 className="text-lg font-bold text-gray-900">No capsules found</h3>
              <p className="text-gray-500 text-sm">You haven't sent any messages to the future yet.</p>
            </div>
          )}

          {capsules.map((cap) => (
            <div 
                key={cap._id} 
                className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md 
                ${cap.delivered 
                    ? "bg-gradient-to-br from-green-50 to-white border-green-100" 
                    : "bg-white border-gray-100 shadow-sm"
                }`}
            >
              
              <div className="flex items-start gap-5 w-full">
                {/* Status Icon */}
                <div className={`p-4 rounded-xl shrink-0 shadow-inner ${cap.delivered ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                  {cap.delivered ? <FiUnlock size={24}/> : <FiLock size={24}/>}
                </div>
                
                <div className="flex-1 min-w-0">
                   {/* Badges */}
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md ${cap.delivered ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                        {cap.delivered ? "OPENED" : "LOCKED"}
                      </span>
                      {cap.attachments?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          <FiFile size={10}/> {cap.attachments.length} Files
                        </span>
                      )}
                   </div>
                   
                   {/* Title / Date */}
                   <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                     {cap.delivered ? "Capsule Unlocked!" : `Opens on ${new Date(cap.deliverAt).toLocaleDateString()}`}
                     {cap.delivered && <FiCheckCircle className="text-green-500" size={16}/>}
                   </h3>
                   
                   {/* Content Preview */}
                   {cap.delivered ? (
                      <p className="text-sm mt-1 text-green-700 font-medium">
                         Published to Family Feed
                      </p>
                   ) : (
                      <p className="text-sm mt-1 text-gray-300 italic select-none blur-[2px]">
                         {cap.content || "Media content only..."}
                      </p>
                   )}

                   {/* Countdown Badge (Only if Locked) */}
                   {!cap.delivered && (
                     <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                       <FiClock size={12}/>
                       {getTimeRemaining(cap.deliverAt)}
                     </div>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 self-end md:self-center">
                 {!cap.delivered && (
                    <button 
                        onClick={() => handleDelete(cap._id)} 
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Destroy Capsule"
                    >
                        <FiTrash2 size={20}/>
                    </button>
                 )}
                 {cap.delivered && (
                    <button 
                        // 🟢 Navigate to Home Feed
                        onClick={() => navigate("/home")} 
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                    >
                        View in Feed <FiArrowRight/>
                    </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}