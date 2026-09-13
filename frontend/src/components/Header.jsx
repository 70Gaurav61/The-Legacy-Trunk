import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiLock, FiCheck } from "react-icons/fi";
import { useAuth } from "../contexts/useAuth";
import NotificationBell from "./NotificationBell";
import ProfileAvatar from "./ProfileAvatar";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [isCopied, setIsCopied] = useState(false);

  const family = user?.families?.[0]; // for family-code in top-bar
  // if (!family) {
  //   console.log("family nahi pahuch rahi hai yaha tak");
  // }

  // console.log("USER FROM AUTH:", user);
  // console.log("FAMILIES:", user?.families);

  // Initialize state from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Sync local input with URL
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleLogout = async () => {
    await logout();
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
      {/* family code */}
      {family && (
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <span className="font-medium text-gray-700">
              {family.name}
            </span>
            <span className="text-xs text-gray-400">▼</span>
          </button>

          <div className="absolute left-0 top-full w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 hidden group-hover:block z-50">

            <p className="text-xs text-gray-500">
              Family Code
            </p>

            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-lg font-bold tracking-wider text-indigo-700">
                {family.familyCode}
              </p>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(family.familyCode);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className={`px-2 py-1 text-xs font-medium border rounded-md transition-all flex items-center gap-1 ${isCopied
                    ? "text-green-600 border-green-300 bg-green-50"
                    : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  }`}
              >
                {isCopied ? (
                  <>
                    <FiCheck size={12} /> Copied!
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. Right Actions */}
      <div className="flex items-center gap-4">

        {user ? (
          <>
            <NotificationBell />

            <Link
              to="/private"
              className="hidden md:flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-all cursor-pointer group ml-1"
            >
              {/* <FiLock className="text-gray-400 group-hover:text-indigo-600" size={14} /> */}
              <span>My Story</span>
            </Link>
            <Link
              to="/vault"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 border-l pl-4 border-gray-200 transition-colors cursor-pointer group"
            >
              <FiLock className="text-red-400 group-hover:text-indigo-600" size={14} />
              <span>Private vault</span>
            </Link>

            <div className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
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