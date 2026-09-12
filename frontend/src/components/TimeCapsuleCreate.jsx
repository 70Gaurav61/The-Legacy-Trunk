import React, { useState } from "react";
import { FiClock, FiCalendar, FiFile, FiLock, FiLoader } from "react-icons/fi";
import { api } from "../services/useAuth";

export default function TimeCapsuleCreate({ onCreated, setToast }) {
  const [content, setContent] = useState("");
  const [deliverAt, setDeliverAt] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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
      
      Array.from(files).forEach((file) => formData.append("attachments", file));

      await api.post("/scheduled-messages", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setToast({message: "Time capsule scheduled successfully!", type: "success"});
      setContent("");
      setFiles([]);
      setDeliverAt("");
      onCreated(); 
    } catch (err) {
      setToast({message: err.response?.data?.message || "Failed to schedule", type: "error"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-slideUp">
       <form onSubmit={handleSubmit} className="space-y-6">
         <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">When should this open?</label>
           <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
               <FiCalendar size={20}/>
             </div>
             <input type="datetime-local" className="w-full pl-12 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white" value={deliverAt} onChange={(e) => setDeliverAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
           </div>
           <p className="text-xs text-orange-500 mt-2 font-medium flex items-center gap-1"><FiLock size={10}/> This will remain locked until the chosen date.</p>
         </div>

         <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Message to the future</label>
           <textarea className="w-full p-4 border border-gray-200 rounded-xl min-h-[150px] focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all resize-none bg-gray-50 focus:bg-white" placeholder="Write a prediction, a wish, or a story for your future self..." value={content} onChange={(e) => setContent(e.target.value)} />
         </div>

         <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Add Photos/Videos</label>
           <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-orange-50 hover:border-orange-200 transition cursor-pointer relative group">
             <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
             <div className="bg-orange-100 text-orange-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><FiFile size={20}/></div>
             <span className="text-sm font-bold text-gray-600 block group-hover:text-orange-600">{files.length > 0 ? `${files.length} files attached` : "Click to upload media"}</span>
             <span className="text-xs text-gray-400 mt-1 block">Up to 5 files allowed</span>
           </div>
         </div>

         <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl shadow-gray-200 active:scale-[0.98]">
           {loading ? <FiLoader className="animate-spin" /> : <><FiClock/> Seal Time Capsule</>}
         </button>
       </form>
    </div>
  );
}