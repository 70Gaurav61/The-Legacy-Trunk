import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();


export const api = axios.create({
  // baseURL: "http://localhost:5000/api/v1",
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : "http://localhost:5000/api/v1",
  withCredentials: true, // important for cookies
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to fetch/refresh the current logged-in user
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user || null);
      return res.data.user;
    } catch (err) {
      setUser(null);
      return null;
    }
  };

  // Fetch user on app start (auto-login if cookie exists)
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      await refreshUser();
      if (mounted) setLoading(false);
    };
    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  // Login
  const login = async (identifier, password) => {
    try {
      if (!identifier || !password) throw new Error("Identifier and password are required");

      const isEmail = identifier.includes("@");
      const payload = isEmail ? { email: identifier } : { username: identifier };
      payload.password = password;

      // 🟢 UPDATED: Added "/auth" prefix
      const res = await api.post("/auth/login", payload);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Login failed";
      throw new Error(message);
    }
  };

  // 🟢 1. Standard Signup
  const signup = async ({ username, email, password, confirmPassword }) => {
    try {
      // 🟢 UPDATED: Added "/auth" prefix
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        confirmPassword,
      });
      if (res?.data?.user) setUser(res.data.user);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Signup failed";
      throw new Error(message);
    }
  };

  // 🟢 2. Claim Signup
  const registerAndClaim = async ({ username, email, password, claimCode }) => {
    try {
      // 🟢 UPDATED: Added "/auth" prefix
      const res = await api.post("/auth/register-claim", {
        username,
        email,
        password,
        claimCode,
      });
      // This user will have primaryPerson set immediately
      if (res?.data?.user) setUser(res.data.user);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Claim failed";
      throw new Error(message);
    }
  };

  // Logout
  const logout = async () => {
    // navigate("/auth/login", { replace: true });
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        registerAndClaim,
        logout,
        setUser,
        refreshUser,
        api // Exporting this allowing calls to api.get('/person/tree/...') to work correctly now
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
