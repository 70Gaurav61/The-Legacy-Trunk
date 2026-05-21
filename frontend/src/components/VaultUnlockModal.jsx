import React, { useState } from "react";
import { api } from "../services/useAuth";

export default function VaultUnlockModal({ onClose, onUnlocked }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post("/vault/unlock", { password });
      onUnlocked(res.data.files);
    } catch {
      setError("Incorrect vault password");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
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

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button type="button" onClick={onClose} className="py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800">
            Cancel
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">
            Unlock
          </button>
        </div>
      </form>
    </div>
  );
}