import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiLock, FiShield } from "react-icons/fi"; // 🟢 Added FiShield
import { useAuth } from "../services/useAuth"; 
import NotificationBell from "./NotificationBell";
import ProfileAvatar from "./ProfileAvatar"; 

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Initialize state from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Sync local input with URL
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 

      if (searchTerm.trim()) {
        navigate(`/home?search=${encodeURIComponent(searchTerm)}`);
      } else {
        navigate('/home'); 
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* 1. Logo */}
      <div className="flex items-center gap-2">
        <Link to={user ? "/home" : "/"} className="text-xl font-bold text-indigo-900 tracking-tight">
          Legacy Trunk
        </Link>
      </div>

      {/* 2. Search Bar */}
      {user && (
        <div className="flex-1 max-w-xl mx-8 relative hidden sm:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyDown={handleSearch} 
            placeholder="Search users, stories, or dates (YYYY-MM-DD)..." 
            className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
      )}

      {/* 3. Right Actions */}
      <div className="flex items-center gap-4">
        
        {user ? (
          <>
            <NotificationBell />

            {/* 🟢 NEW: Secure Vault Link (Expands on Hover) */}
            <Link 
              to="/vault"
              className="hidden md:flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-all cursor-pointer group border-l pl-4 border-gray-200"
            >
              <FiShield size={18} className="group-hover:scale-110 transition-transform" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-500 ease-in-out text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100">
                My Vault
              </span>
            </Link>

            {/* 🟢 UPDATED: Private Story Link (Expands on Hover) */}
            <Link 
              to="/private"
              className="hidden md:flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-all cursor-pointer group ml-1"
            >
              <FiLock size={18} className="group-hover:scale-110 transition-transform" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-500 ease-in-out text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100">
                Private Story
              </span>
            </Link>

            {/* Avatar */}
            <div className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity ml-2">
               {ProfileAvatar ? <ProfileAvatar user={user} /> : (
                 <div className="w-full h-full rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                 </div>
               )}
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/auth/login" className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-200">Login</Link>
            <Link to="/auth/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition duration-200">Sign Up</Link>
          </>
        )}

      </div>
    </header>
  );
}