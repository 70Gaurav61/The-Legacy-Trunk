import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden scale-100 transform transition-all">
        
        {/* Header */}
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-full">
            <FiAlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold text-red-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="ml-auto text-red-400 hover:text-red-700 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-transform active:scale-95"
          >
            Yes, Delete It
          </button>
        </div>

      </div>
    </div>
  );
}