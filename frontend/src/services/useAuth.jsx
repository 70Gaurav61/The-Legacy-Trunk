import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

// Create axios instance for auth API
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1/auth",
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
        const res = await api.get("/me");
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

  // Login: identifier can be username OR email
  // usage: await login("ashish123", "password") OR login("ashish@example.com", "password")
  const login = async (identifier, password) => {
    try {
      if (!identifier || !password) throw new Error("Identifier and password are required");

      // simple heuristic: treat as email if contains '@'
      const isEmail = identifier.includes("@");
      const payload = isEmail
        ? { email: identifier }
        : { username: identifier };

      payload.password = password;

      const res = await api.post("/login", payload);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      // normalize error message
      const message = err?.response?.data?.message || err.message || "Login failed";
      throw new Error(message);
    }
  };

  // Signup (register)
  // usage: await signup({ username, email, password, confirmPassword })
  const signup = async ({ username, email, password, confirmPassword }) => {
    try {
      if (!username || !email || !password || !confirmPassword) {
        throw new Error("username, email, password and confirmPassword are required");
      }

      const res = await api.post("/register", {
        username,
        email,
        password,
        confirmPassword,
      });

      // server returns user and sets cookie. Set user in state.
      if (res?.data?.user) setUser(res.data.user);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Signup failed";
      throw new Error(message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      // ignore network errors on logout, still clear client state
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
        logout,
        setUser, // optional: in case you want manual update
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
