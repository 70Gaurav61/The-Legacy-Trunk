import React, { useState, useEffect } from "react";
import { FiLock, FiUnlock, FiFileText, FiImage, FiPlus } from "react-icons/fi";
import { api } from "../services/useAuth";

export default function Vault() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Unlock Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [decryptedUrl, setDecryptedUrl] = useState(null);
  const [error, setError] = useState(null);

  // 1. Fetch Locked Items (Metadata only, no file URLs)
  useEffect(() => {
    fetchVaultItems();
  }, []);

  const fetchVaultItems = async () => {
    try {
      const res = await api.get("/storage"); // uses storageController.getStorageItems
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load vault", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Unlock Attempt
  // Note: Since your backend hashes passwords, you usually verify this 
  // by sending the password to an endpoint like POST /storage/:id/verify
  // If you haven't built that verify endpoint yet, you might need to.
  // Assuming a verify endpoint exists:
  const handleUnlock = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 🟢 Requirement: You need a route to verify storage password and get the signed URL
      // If simply returning the URL in getStorageItems was risky, this is safer.
      const res = await api.post(`/storage/${selectedItem._id}/unlock`, { password: passwordInput });
      
      if (res.data.success) {
         setDecryptedUrl(res.data.fileUrl); // Backend returns real URL only on success
      }
    } catch (err) {
      setError("Incorrect password. Access denied.");
    }
  };

  const closeUnlockModal = () => {
    setSelectedItem(null);
    setPasswordInput("");
    setDecryptedUrl(null);
    setError(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiLock className="text-indigo-600" /> Family Vault
          </h1>
          <p className="text-gray-500 mt-1">Securely store important documents (Wills, Deeds, Medical Records).</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <FiPlus /> Upload Secure File
        </button>
      </div>

      {loading ? (
        <div>Loading Vault...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item._id} 
              onClick={() => setSelectedItem(item)}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg cursor-pointer transition-all group relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FiLock size={100} />
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${item.file.mimeType.includes('image') ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                   {item.file.mimeType.includes('image') ? <FiImage size={24} /> : <FiFileText size={24} />}
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-400 gap-2">
                <FiLock size={12} /> Password Protected
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UNLOCK MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fadeIn">
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Restricted Access</h2>
              <p className="text-gray-500 mt-2">
                Enter the specific password for <strong>"{selectedItem.title}"</strong> to decrypt it.
              </p>
            </div>

            {!decryptedUrl ? (
              <form onSubmit={handleUnlock} className="space-y-4">
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Document Password"
                  className="w-full text-center text-2xl tracking-widest border-2 border-gray-200 rounded-xl py-3 focus:border-indigo-500 outline-none transition-colors"
                  autoFocus
                />
                
                {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button 
                    type="button" 
                    onClick={closeUnlockModal}
                    className="py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all"
                  >
                    Unlock File
                  </button>
                </div>
              </form>
            ) : (
              // FILE REVEALED
              <div className="text-center space-y-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                  <FiUnlock className="mx-auto mb-2" size={24}/>
                  Access Granted
                </div>
                
                <a 
                  href={decryptedUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Download / View File
                </a>
                <button onClick={closeUnlockModal} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}