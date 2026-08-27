import React from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiLock, FiUnlock, FiAlertCircle, FiFile, FiCheckCircle, FiArrowRight, FiTrash2, FiX } from "react-icons/fi";

const getCapsuleState = (cap) => {
    if (cap.delivered && !cap.memoryId) return 'MEMORY_DELETED';
    if (cap.delivered) return 'UNLOCKED';
    return 'LOCKED';
};

const isTimeUp = (dateString) => {
   return (Date.parse(dateString) - Date.parse(new Date())) <= 0;
};

const getTimeRemainingText = (dateString) => {
  const total = Date.parse(dateString) - Date.parse(new Date());
  if (total <= 0) return "Ready to open"; 
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  if (days > 365) return `${Math.floor(days/365)} years left`;
  if (days > 0) return `${days} days left`;
  return "Less than 24h left";
};

export default function TimeCapsuleList({ capsules, loading, initiateDelete }) {
  const navigate = useNavigate();

  return (
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

      {capsules.map((cap) => {
         const state = getCapsuleState(cap);
         const timeUp = isTimeUp(cap.deliverAt);

         return (
            <div key={cap._id} className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md ${state === 'UNLOCKED' ? "bg-gradient-to-br from-green-50 to-white border-green-100" : ""} ${state === 'MEMORY_DELETED' ? "bg-gray-50 border-gray-200 opacity-75" : ""} ${state === 'LOCKED' ? "bg-white border-gray-100 shadow-sm" : ""}`}>
              <div className="flex items-start gap-5 w-full">
                <div className={`p-4 rounded-xl shrink-0 shadow-inner ${state === 'UNLOCKED' ? 'bg-green-100 text-green-600' : ''} ${state === 'LOCKED' ? 'bg-orange-50 text-orange-500' : ''} ${state === 'MEMORY_DELETED' ? 'bg-gray-200 text-gray-500' : ''}`}>
                  {state === 'UNLOCKED' && <FiUnlock size={24}/>}
                  {state === 'LOCKED' && <FiLock size={24}/>}
                  {state === 'MEMORY_DELETED' && <FiAlertCircle size={24}/>}
                </div>
                
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md ${state === 'UNLOCKED' ? "bg-green-200 text-green-800" : ""} ${state === 'LOCKED' ? "bg-orange-100 text-orange-600" : ""} ${state === 'MEMORY_DELETED' ? "bg-gray-200 text-gray-600" : ""}`}>
                        {state === 'MEMORY_DELETED' ? "MEMORY DELETED" : (state === 'UNLOCKED' ? "OPENED" : "LOCKED")}
                      </span>
                      {cap.attachments?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100"><FiFile size={10}/> {cap.attachments.length} Files</span>
                      )}
                   </div>
                   
                   <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                     {state === 'UNLOCKED' && "Capsule Unlocked!"}
                     {state === 'LOCKED' && `Opens on ${new Date(cap.deliverAt).toLocaleDateString()}`}
                     {state === 'MEMORY_DELETED' && "Story Deleted from Feed"}
                     {state === 'UNLOCKED' && <FiCheckCircle className="text-green-500" size={16}/>}
                   </h3>
                   
                   {state === 'UNLOCKED' && <p className="text-sm mt-1 text-green-700 font-medium">Published to Family Feed</p>}
                   {state === 'MEMORY_DELETED' && <p className="text-sm mt-1 text-gray-500 italic">The memory associated with this capsule was deleted.</p>}
                   {state === 'LOCKED' && <p className="text-sm mt-1 text-gray-300 italic select-none blur-[2px]">{cap.content || "Media content only..."}</p>}

                   {state === 'LOCKED' && (
                       timeUp ? (
                          <button onClick={() => navigate("/home")} className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg hover:bg-green-200 transition-colors animate-pulse"><FiArrowRight /> Visit Home Feed to Open</button>
                       ) : (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100"><FiClock size={12}/> {getTimeRemainingText(cap.deliverAt)}</div>
                       )
                   )}
                </div>
              </div>

              <div className="flex gap-2 self-end md:self-center">
                 <button 
                     onClick={() => initiateDelete(cap._id, state === 'LOCKED' ? 'locked' : (state === 'UNLOCKED' ? 'unlocked' : 'deleted'))} 
                     className={`p-3 rounded-xl transition-colors ${state === 'LOCKED' ? "text-red-400 hover:bg-red-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                     title={state === 'LOCKED' ? "Destroy Capsule" : "Clear from list"}
                 >
                     {state === 'LOCKED' ? <FiTrash2 size={20}/> : <FiX size={20}/>}
                 </button>
                 
                 {state === 'UNLOCKED' && <button onClick={() => navigate("/home")} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">View in Feed <FiArrowRight/></button>}
              </div>
            </div>
         );
      })}
    </div>
  );
}