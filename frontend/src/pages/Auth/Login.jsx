import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        { email, password },
        { withCredentials: true } // for cookies
      );

      const userData = res.data;
    //   console.log(res);

      // Conditional navigation
      if (userData.user.families && userData.user.families.length > 0) {
        navigate("/dashboard");
      } else {
        navigate("/choose");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
        Login
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 block w-full border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Don’t have an account?{" "}
        <a href="/signup" className="text-indigo-600 font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
}
