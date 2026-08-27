import React, { useState } from "react";
import { api } from "../services/useAuth";

export default function VaultUploadModal({ onClose, onUploaded }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      onUploaded();
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <form
        onSubmit={handleUpload}
        className="bg-white p-8 rounded-xl w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Upload to Vault</h2>

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
          <button type="button" onClick={onClose} className="py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800">
            Cancel
          </button>
          <button disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
}