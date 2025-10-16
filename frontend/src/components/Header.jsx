import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import ProfileAvatar from "./ProfileAvatar";
import { useAuth } from "../services/useAuth"; // ✅ correct path

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  }
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-100">
      {/* Logo or Title */}
      <div className="text-2xl font-bold text-indigo-700 tracking-tight">
        <Link to="/">Legacy Trunk</Link>
      </div>

      {/* Show SearchBox only if user is logged in */}
      {user && (
        <div className="hidden sm:block flex-1 mx-6">
          <SearchBox />
        </div>
      )}

      {/* Right side: profile if logged in, else Login + Signup buttons */}
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <span className="text-sm font-medium text-gray-500 hidden md:block">
              My Private Story
            </span>

            <ProfileAvatar user={user} />

            {/* Optional logout button */}
            <button
              onClick={handleLogout}
              
              className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/auth/login"
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition duration-200"
            >
              Login
            </Link>
            <Link
              to="/auth/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
