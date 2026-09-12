import React, { useState } from "react";
import { api } from "../services/useAuth";

export default function VaultCreate({ onCreated, setLoading }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createError, setCreateError] = useState(null);

  const handleCreateVault = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (newPassword !== confirmPassword) {
      setCreateError("Passwords do not match");
      return;
    }

    try {
      await api.post("/vault/create", { password: newPassword });
      setLoading(true);
      onCreated();
    } catch {
      setCreateError("Failed to create vault");
    }
  };

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