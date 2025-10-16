import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// ✅ Create Context
const AuthContext = createContext();

// ✅ Axios defaults (important for cookies)
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch user on app start (auto-login if cookie exists)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/auth/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // --- Login
  const login = async (email, password) => {
    const res = await axios.post(
      "http://localhost:5000/api/v1/auth/login",
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.user);
    return res.data.user;
  };

  // --- Signup
  const signup = async (name, email, password) => {
    const res = await axios.post("http://localhost:5000/api/v1/auth/register", {
      name,
      email,
      password,
    });
    return res.data;
  };

  // --- Logout
  const logout = async () => {
    await axios.post(
      "http://localhost:5000/api/v1/auth/logout",
      {},
      { withCredentials: true }
    );
    setUser(null);
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

// ✅ Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
