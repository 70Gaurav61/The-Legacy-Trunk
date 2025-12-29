import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // 🟢 useLocation is critical here
import { FiX, FiSearch } from "react-icons/fi"; 
import { api } from "../services/useAuth"; 
import Sidebar from "../components/Sidebar"; 
import StoriesRail from "../components/StoriesRail"; 
import MemoriesFeed from "../components/MemoriesFeed"; 

export default function Home() {
  const location = useLocation(); // 🟢 Listens for URL changes
  const navigate = useNavigate();

  // 🟢 Helper to parse search term reliably
  const getSearchTerm = () => {
    const params = new URLSearchParams(location.search);
    return params.get("search");
  };
  
  // This value will update every time the URL changes
  const searchTerm = getSearchTerm(); 

  const [activeUserFilter, setActiveUserFilter] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFamilyId, setActiveFamilyId] = useState(null); 
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Get User -> Then Get Family Members
  useEffect(() => {
    const initData = async () => {
      try {
        const meRes = await api.get("/auth/me");
        const user = meRes.data.user;
        setCurrentUser(user);

        if (user.families && user.families.length > 0) {
          const familyId = user.families[0]; 
          setActiveFamilyId(familyId);

          const membersRes = await api.get(`/families/${familyId}/members`);
          setFamilyMembers(membersRes.data);
        }

      } catch (error) {
        console.error("Failed to load initial data", error);
      }
    };
    initData();
  }, []);

  // 2. Fetch Memories (Re-runs when location.search changes)
  useEffect(() => {
    if (!activeFamilyId) return; 

    const fetchMemories = async () => {
      try {
        setLoading(true);
        
        // 🟢 BUILD URL MANUALLY
        // This ensures the backend receives the query string correctly
        const params = new URLSearchParams();
        
        if (activeUserFilter) {
            params.append("userId", activeUserFilter);
        }
        
        if (searchTerm) {
            params.append("search", searchTerm);
        }

        const queryString = params.toString();
        const url = queryString 
            ? `/memories/${activeFamilyId}?${queryString}` 
            : `/memories/${activeFamilyId}`;


        const res = await api.get(url); 
        setMemories(res.data);

      } catch (error) {
        console.error("Failed to load memories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
    
    // 🟢 CRITICAL: 'location.search' ensures this runs when URL updates
  }, [activeUserFilter, activeFamilyId, location.search]); 

  // Helper: Clear Search
  const clearSearch = () => {
    navigate('/'); 
  };

  return (
    <div className="flex h-full w-full gap-6 bg-gray-50">
      <div className="hidden rounded-3xl lg:block sticky top-0 right-0">
        <Sidebar />
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[800px]">
        {/* Top Rail */}
        <div className="flex-shrink-0 z-10 bg-gray-50/95 backdrop-blur shadow-sm">
          <StoriesRail 
            users={familyMembers} 
            currentUser={currentUser}
            selectedUser={activeUserFilter} 
            onSelectUser={setActiveUserFilter} 
          />
        </div>

        {/* Main Feed Area */}
        <div className="flex-1 bg-white">
          {loading ? (
            <div className="p-20 text-center text-gray-400">Loading your memories...</div>
          ) : (
            <>
              {/* 🟢 SEARCH RESULTS HEADER (Only shows when searching) */}
              {searchTerm && (
                <div className="px-8 pt-8 pb-2 flex items-center justify-between animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-indigo-600">"{searchTerm}"</span>
                      <span className="text-gray-400 text-base font-normal">search results</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Found {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={clearSearch}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-full transition-all"
                  >
                    <FiX size={16} /> Clear Search
                  </button>
                </div>
              )}

              {/* 🟢 FEED OR EMPTY STATE */}
              {memories.length === 0 && searchTerm ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                     <FiSearch size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">No results found</h3>
                  <p>Try searching for a different name, date, or keyword.</p>
                  <button 
                    onClick={clearSearch}
                    className="mt-4 text-indigo-600 font-semibold hover:underline"
                  >
                    View all memories
                  </button>
                </div>
              ) : (
                <MemoriesFeed memories={memories} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}