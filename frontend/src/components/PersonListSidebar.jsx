import React, { useState, useEffect } from "react";
import { api } from "../services/useAuth.jsx"; 
import { FiShare2, FiSearch, FiCopy, FiCheck, FiX, FiLink } from "react-icons/fi"; // 🟢 Added FiLink

export default function PersonListSidebar() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Share Data now holds the full link
  const [shareData, setShareData] = useState(null); 
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchManagedPersons();
  }, []);

  const fetchManagedPersons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/persons/managed");
      setPersons(res.data);
    } catch (err) {
      console.error("Failed to load sidebar list", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async (personId, personName) => {
    try {
      // 1. Get the code from backend
      const res = await api.post(`/persons/${personId}/invite`);
      const code = res.data.claimCode;

      // 🟢 2. Construct the Full URL
      // Uses the current domain (localhost or production) automatically
      const link = `${window.location.origin}/auth/signup?code=${code}`;
      
      setShareData({ id: personId, name: personName, link: link });
      setCopied(false);
    } catch (err) {
      console.error(err);
      alert("Could not generate link.");
    }
  };

  const handleCopy = () => {
    if (shareData?.link) {
      navigator.clipboard.writeText(shareData.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filtered = persons.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col shadow-xl z-30 flex-shrink-0">
      
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 mb-3">Created People</h2>
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 🟢 SHARE LINK POPUP */}
      {shareData && (
        <div className="bg-indigo-50 p-4 border-b border-indigo-100 relative animate-fadeIn">
          <button onClick={() => setShareData(null)} className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-700">
            <FiX size={14} />
          </button>
          
          <div className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider flex items-center gap-1">
            <FiLink /> Invite Link for {shareData.name.split(" ")[0]}
          </div>

          <div className="flex items-center gap-2">
            {/* Read-only input for the link */}
            <input 
              readOnly
              value={shareData.link}
              className="flex-1 bg-white border border-indigo-200 text-indigo-800 text-xs px-3 py-2 rounded-md outline-none truncate"
            />
            
            <button 
              onClick={handleCopy}
              className={`p-2 rounded-lg shadow-sm transition-all ${copied ? "bg-green-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
              title="Copy Link"
            >
              {copied ? <FiCheck size={16}/> : <FiCopy size={16}/>}
            </button>
          </div>
          
          <p className="text-[10px] text-indigo-400 mt-2 leading-tight">
            Share this link. When they sign up, they will automatically claim this profile.
          </p>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center text-gray-400 mt-10 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 text-sm">No other people created.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(person => (
              <div key={person._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${person.gender === 'male' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-pink-50 border-pink-100 text-pink-600'}`}>
                    {person.avatarUrl ? <img src={person.avatarUrl} alt={person.name} className="w-full h-full rounded-full object-cover"/> : person.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 leading-tight">{person.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {person.relationType === 'son' ? 'Son' : person.relationType === 'daughter' ? 'Daughter' : person.relationType === 'spouse' ? 'Spouse' : 'Relative'}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleGenerateLink(person._id, person.name)}
                  className="text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-all"
                  title="Generate Invite Link"
                >
                  <FiShare2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}