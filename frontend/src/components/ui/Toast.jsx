import React, { useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = type === "success" 
    ? "bg-white border-l-4 border-green-500 text-gray-800" 
    : "bg-white border-l-4 border-red-500 text-gray-800";

  const Icon = type === "success" ? FiCheckCircle : FiAlertCircle;
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 shadow-2xl rounded-lg animate-slideIn ${styles} min-w-[300px]`}>
      <Icon className={`text-xl ${iconColor}`} />
      <div className="flex-1 font-medium text-sm">{message}</div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <FiX size={18} />
      </button>
    </div>
  );
}