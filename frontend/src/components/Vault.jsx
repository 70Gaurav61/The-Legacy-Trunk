import React, { useEffect, useState } from "react";
import { FiLock, FiUnlock, FiFileText, FiImage, FiPlus } from "react-icons/fi";
import { api } from "../services/useAuth";
import VaultCreate from "./VaultCreate";
import VaultUnlockModal from "./VaultUnlockModal";
import VaultUploadModal from "./VaultUploadModal";
import MediaPreviewModal from "./MediaPreviewModal";

export default function Vault() {
  /* VAULT */
  const [vault, setVault] = useState(null);
  const [unlockedFiles, setUnlockedFiles] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  /* UNLOCK */
  const [showUnlock, setShowUnlock] = useState(false);

  /* UPLOAD */
  const [showUpload, setShowUpload] = useState(false);

  /* 🔴 ADDED: PREVIEW STATE */
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    fetchVault();
  }, []);

  const fetchVault = async () => {
    try {
      const res = await api.get("/vault");
      setVault(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlocked = (files) => {
    setUnlockedFiles(files);
    setIsUnlocked(true);
    setShowUnlock(false);
  };

  const handleUploaded = () => {
      setShowUpload(false);
      setIsUnlocked(false);
      setUnlockedFiles([]);
      setLoading(true);
      fetchVault();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  /* CREATE VAULT UI */
  if (vault === null) {
    return <VaultCreate onCreated={fetchVault} setLoading={setLoading} />;
  }

  const files = isUnlocked ? unlockedFiles : vault.files;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FiLock /> {vault.vaultName || "My Vault"}
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowUnlock(true)}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            <FiUnlock /> Unlock
          </button>

          <button
            onClick={() => setShowUpload(true)}
            disabled={!isUnlocked}
            className={`px-4 py-2 rounded-lg text-white ${
              isUnlocked
                ? "bg-indigo-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <FiPlus /> Upload
          </button>
        </div>
      </div>

      {/* 🟡 MODIFIED: CLICKABLE PREVIEW GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {files.map((file, i) => (
          <div
            key={i}
            onClick={() => file.url && setPreviewFile(file)} // 🔴 ADDED
            className="border p-4 rounded-xl bg-white shadow-sm cursor-pointer hover:shadow-lg"
          >
            {/* IMAGE */}
            {file.mimeType?.startsWith("image") && file.url && (
              <img
                src={file.url}
                className="w-full h-40 object-cover rounded-lg"
                alt={file.originalName}
              />
            )}

            {/* VIDEO */}
            {file.mimeType?.startsWith("video") && file.url && (
              <video
                src={file.url}
                className="w-full h-40 object-cover rounded-lg"
                muted
                preload="metadata"
              />
            )}

            {/* DOCUMENT */}
            {!file.mimeType?.startsWith("image") &&
              !file.mimeType?.startsWith("video") && (
                <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                  <FiFileText size={32} />
                </div>
              )}

            <p className="font-semibold mt-3 text-sm truncate">
              {file.originalName}
            </p>

            {!file.url && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <FiLock /> Locked
              </p>
            )}
          </div>
        ))}
      </div>

      {previewFile && <MediaPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {showUnlock && (
        <VaultUnlockModal 
          onClose={() => setShowUnlock(false)} 
          onUnlocked={handleUnlocked} 
        />
      )}

      {showUpload && (
        <VaultUploadModal 
          onClose={() => setShowUpload(false)} 
          onUploaded={handleUploaded} 
        />
      )}
    </div>
  );
}
