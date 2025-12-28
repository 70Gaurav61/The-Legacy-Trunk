import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiLock, FiArrowLeft } from "react-icons/fi";
import { api } from "../services/useAuth";
import MemoriesFeed from "../components/MemoriesFeed";

const useCurrentFamily = () => {
    const [familyId, setFamilyId] = useState(null);
    useEffect(() => {
        api.get("/auth/me").then(res => {
            if(res.data.user.families.length > 0) {
                setFamilyId(res.data.user.families[0]);
            }
        });
    }, []);
    return familyId;
};

export default function PrivateGallery() {
  const familyId = useCurrentFamily();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;

    const fetchPrivateMemories = async () => {
      try {
        setLoading(true);
        // 🟢 Call API with visibility=private
        const res = await api.get(`/memories/${familyId}?visibility=private`);
        setMemories(res.data);
      } catch (error) {
        console.error("Failed to load private stories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivateMemories();
  }, [familyId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-indigo-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-4 transition-colors">
            <FiArrowLeft /> Back to Family Feed
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <FiLock size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Private Stories</h1>
              <p className="text-indigo-200 mt-1">Memories visible only to you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto -mt-8 relative z-10 px-4">
        <div className="bg-white rounded-3xl shadow-xl min-h-[500px] border border-gray-100">
          {loading ? (
             <div className="p-20 text-center text-gray-400">Loading your vault...</div>
          ) : (
             <MemoriesFeed memories={memories} />
          )}
        </div>
      </div>
    </div>
  );
}