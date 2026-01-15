import React, { useEffect, useState } from "react";
import { FiLock, FiUnlock, FiFileText, FiImage, FiPlus } from "react-icons/fi";
import { api } from "../services/useAuth";

export default function Vault() {
  /* CREATE VAULT */
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createError, setCreateError] = useState(null);

  /* VAULT */
  const [vault, setVault] = useState(null);
  const [unlockedFiles, setUnlockedFiles] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  /* UNLOCK */
  const [showUnlock, setShowUnlock] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  /* UPLOAD */
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  /* CREATE VAULT */
  const handleCreateVault = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (newPassword !== confirmPassword) {
      setCreateError("Passwords do not match");
      return;
    }

    await api.post("/vault/create", { password: newPassword });
    setLoading(true);
    fetchVault();
  };

  /* UNLOCK VAULT */
  const handleUnlock = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post("/vault/unlock", { password });
      setUnlockedFiles(res.data.files);
      setIsUnlocked(true);
      setShowUnlock(false);
      setPassword("");
    } catch {
      setError("Incorrect vault password");
    }
  };

  /* UPLOAD FILE */
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadFile) {
      setUploadError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      setUploading(true);
      await api.post("/vault/upload", formData);

      setShowUpload(false);
      setUploadFile(null);
      setIsUnlocked(false);
      setUnlockedFiles([]);
      setLoading(true);
      fetchVault();
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  /* CREATE VAULT UI */
  if (vault === null) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">
          Create Your Personal Vault
        </h1>

        <form onSubmit={handleCreateVault} className="space-y-4">
          <input
            type="password"
            placeholder="Set vault password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Confirm vault password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />
          {createError && (
            <p className="text-red-500 text-center">{createError}</p>
          )}
          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg">
            Create Vault
          </button>
        </form>
      </div>
    );
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

      {/* 🔴 ADDED: PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>

          <div className="max-w-5xl max-h-[90vh] w-full p-4 flex items-center justify-center">
            {previewFile.mimeType?.startsWith("image") && (
              <img
                src={previewFile.url}
                className="max-h-[90vh] max-w-full rounded-lg"
                alt={previewFile.originalName}
              />
            )}

            {previewFile.mimeType?.startsWith("video") && (
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="max-h-[90vh] max-w-full rounded-lg"
              />
            )}

            {!previewFile.mimeType?.startsWith("image") &&
              !previewFile.mimeType?.startsWith("video") && (
                <iframe
                  src={previewFile.url}
                  title={previewFile.originalName}
                  className="w-full h-[90vh] rounded-lg bg-white"
                />
              )}
          </div>
        </div>
      )}

      {/* UNLOCK MODAL */}
      {showUnlock && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <form
            onSubmit={handleUnlock}
            className="bg-white p-8 rounded-xl w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Unlock Personal Vault
            </h2>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg text-center"
              placeholder="Vault password"
              autoFocus
            />

            {error && (
              <p className="text-red-500 text-center mt-2">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowUnlock(false)}
                className="py-2 rounded-lg"
              >
                Cancel
              </button>
              <button className="bg-indigo-600 text-white py-2 rounded-lg">
                Unlock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <form
            onSubmit={handleUpload}
            className="bg-white p-8 rounded-xl w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Upload to Vault
            </h2>

            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full border p-3 rounded-lg"
              accept="image/*,video/*,application/pdf"
            />

            {uploadError && (
              <p className="text-red-500 text-center mt-2">{uploadError}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={uploading}
                className="bg-indigo-600 text-white py-2 rounded-lg"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
