import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

// 🟢 FIX: Base URL is now the API Root (removed "/auth")
// This allows this instance to be used for /person, /family, AND /auth routes.
export const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true, // important for cookies
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user on app start (auto-login if cookie exists)
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        // 🟢 UPDATED: Added "/auth" prefix
        const res = await api.get("/auth/me");
        if (mounted) setUser(res.data.user || null);
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUser();
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
    try {
      // 🟢 UPDATED: Added "/auth" prefix
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
        api // Exporting this allowing calls to api.get('/person/tree/...') to work correctly now
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);