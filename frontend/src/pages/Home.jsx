import React, { useState, useEffect } from "react";
import { api } from "../services/useAuth"; 
import Sidebar from "../components/Sidebar"; 
import StoriesRail from "../components/StoriesRail"; 
import MemoriesFeed from "../components/MemoriesFeed"; 

export default function Home() {
  const [activeUserFilter, setActiveUserFilter] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFamilyId, setActiveFamilyId] = useState(null); // 🟢 New State
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Get User -> Then Get Family Members
  useEffect(() => {
    const initData = async () => {
      try {
        // Step A: Get Current User
        const meRes = await api.get("/auth/me");
        const user = meRes.data.user;
        setCurrentUser(user);

        // Step B: Get Family ID (Assuming user has at least one family)
        if (user.families && user.families.length > 0) {
          const familyId = user.families[0]; // Use the first family for now
          setActiveFamilyId(familyId);

          // Step C: Get Members using the correct Route
          // 🟢 FIX: Matches router.get("/:familyId/members")
          const membersRes = await api.get(`/families/${familyId}/members`);
          setFamilyMembers(membersRes.data);
        }

      } catch (error) {
        console.error("Failed to load initial data", error);
      }
    };
    initData();
  }, []);

  // 2. Fetch Memories (Depends on Family ID)
  useEffect(() => {
    if (!activeFamilyId) return; // Don't fetch if we don't know the family yet

    const fetchMemories = async () => {
      try {
        setLoading(true);
        const query = activeUserFilter ? `?userId=${activeUserFilter}` : "";
        
        // 🟢 FIX: Matches router.get("/:familyId") in memoryRoutes
        const res = await api.get(`/memories/${activeFamilyId}${query}`); 
        setMemories(res.data);
      } catch (error) {
        console.error("Failed to load memories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [activeUserFilter, activeFamilyId]); // Re-run when filter OR family changes

  return (
    <div className="flex h-full w-full gap-6 bg-gray-50">
      <div className="hidden rounded-3xl lg:block sticky top-0 right-0">
        <Sidebar />
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[800px]">
        <div className="flex-shrink-0 z-10 bg-gray-50/95 backdrop-blur shadow-sm">
          <StoriesRail 
            users={familyMembers} 
            currentUser={currentUser}
            selectedUser={activeUserFilter} 
            onSelectUser={setActiveUserFilter} 
          />
        </div>

        <div className="flex-1 bg-white">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : (
            <MemoriesFeed memories={memories} />
          )}
        </div>
      </div>
    </div>
  );
}