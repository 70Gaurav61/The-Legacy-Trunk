import React from "react";
import { FiClock, FiX } from "react-icons/fi";

export default function HistoryModal({ versions, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold flex items-center gap-2 text-gray-800">
            <FiClock className="text-blue-600"/> Edit History
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><FiX size={20}/></button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-6">
          {versions.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No edit history found.</p>
          ) : (
            versions.map((v) => (
              <div key={v._id} className="relative pl-6 border-l-2 border-gray-200 hover:border-blue-400 transition-colors group">
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-blue-500 transition-colors"></div>
                
                {/* Header Info */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-600">
                      {new Date(v.createdAt).toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-400">by {v.editor?.username || "Unknown"}</p>
                  </div>
                </div>

                {/* Content Snapshot */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  {v.previousTitle && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Previous Title</span>
                      <p className="text-gray-800 font-medium">{v.previousTitle}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}