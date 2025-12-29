import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { api } from "../services/useAuth"; 

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 1. Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications"); 
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  // 2. Initial Load + Auto-Poll
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 3. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Handle Click on Notification
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => 
          prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
        );
      }

      setIsOpen(false);
      
      // Navigate Logic
      // Inside handleNotificationClick...
  
      // Inside handleNotificationClick in NotificationBell.jsx

      if (notif.type === 'memory_tag' || notif.type === 'new_memory' || notif.type === 'on_this_day') {
        navigate(`/stories/${notif.payload?.memoryId}`); 
      } 
      // 🟢 Add this case
      else if (notif.type === 'birthday_alert') {
        navigate('/family-tree'); // Or /timeline
      }
      else if (notif.type === 'family_invite') {
        navigate('/family-tree');
      }
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  // 🟢 5. NEW FUNCTION: Mark All Read
  const handleMarkAllRead = async (e) => {
    e.stopPropagation(); // Prevent closing the dropdown immediately
    try {
      // Optimistically update UI (Instant feel)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      // Call Backend
      await api.put("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all read", err);
      // Ideally re-fetch if it fails, but for read status it's usually fine
      fetchNotifications();
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* 🔔 BELL ICON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 📜 DROPDOWN LIST */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn origin-top-right">
          
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              // 🟢 ATTACHED FUNCTION HERE
              <span 
                className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline hover:text-indigo-800 transition-colors" 
                onClick={handleMarkAllRead}
              >
                Mark all read
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 ${
                    notif.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
                  }`}
                >
                  {/* Indicator Dot for Unread */}
                  {!notif.read && (
                    <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}

                  <div className="flex-1">
                    <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                      {notif.payload?.message || "New activity in your family tree"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {notif.read && <FiCheck size={14} className="text-gray-300 mt-1" />}
                </div>
              ))
            )}
          </div>

          <div className="p-2 text-center border-t border-gray-100">
            <button className="text-xs text-gray-500 hover:text-indigo-600 font-medium">
              View All History
            </button>
          </div>

        </div>
      )}
    </div>
  );
}