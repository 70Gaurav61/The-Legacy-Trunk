import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/useAuth";
import Toast from "../components/ui/Toast";
import MemoriesFeed from "../components/MemoriesFeed";

export default function PersonProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ person: null, memories: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/persons/profile/${id}`);
        // If this person is linked to a user, redirect to that user's profile
        const linkedUser = res.data.person.user && (res.data.person.user._id || res.data.person.user);
        if (linkedUser) {
          // Replace the temporary /person/:id entry with the canonical /profile/:userId
          // so the browser Back button returns to the tree instead of cycling through
          // the intermediate person route.
          navigate(`/profile/${linkedUser}`, { replace: true });
          return;
        }
        setData({ person: res.data.person, memories: res.data.memories || [] });
      } catch (err) {
        setToast({ message: err.response?.data?.message || "Failed to load person", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!data.person) return <div className="h-screen flex items-center justify-center">Person not found.</div>;

  const { person, memories } = data;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fadeIn relative min-h-screen bg-gray-50/50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="relative bg-gradient-to-r from-gray-600 to-gray-700 h-44 sm:rounded-b-3xl shadow-lg">
        <div className="absolute -bottom-12 left-8 flex items-end">
          <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
            <img src={person.avatarUrl || `https://ui-avatars.com/api/?name=${person.name || 'Person'}&background=random`} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="mt-16 px-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{person.name}</h1>
          <p className="text-gray-500 text-sm font-medium">{person.dob ? new Date(person.dob).toLocaleDateString() : "Date unknown"}</p>
        </div>
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Status</h3>
            <p className="text-gray-700 text-sm">This person is not authenticated. You can view the details recorded for them and their tagged posts.</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Tagged Posts</h3>
          <MemoriesFeed layout="grid" memories={memories} isOwner={false} />
        </div>
      </div>
    </div>
  );
}
