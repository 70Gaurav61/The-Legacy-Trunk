import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom"; // ✅ Added useSearchParams
import { useAuth, api } from "../../services/useAuth.jsx"; // ✅ Import api for username check
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiCheckCircle, FiXCircle, FiLoader, FiGift } from "react-icons/fi";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export default function Signup() {
  const { signup, registerAndClaim } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ✅ Get URL params

  // Check if this is an "Invite" flow
  const inviteCode = searchParams.get("code");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkIdRef = useRef(0);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "username") {
      const trimmed = value.trim();
      if (trimmed === "") {
        setUsernameError("");
        setUsernameAvailable(null);
        setCheckingUsername(false);
      } else if (!USERNAME_REGEX.test(trimmed)) {
        setUsernameError("Only letters, numbers and underscores allowed.");
        setUsernameAvailable(null);
        setCheckingUsername(false);
      } else {
        setUsernameError("");
      }
    }
  };

  // Debounce Username Check
  useEffect(() => {
    const username = (form.username || "").trim();
    if (!username || !USERNAME_REGEX.test(username)) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    let cancelled = false;
    const checkId = ++checkIdRef.current;
    setCheckingUsername(true);
    setUsernameAvailable(null);

    const handler = setTimeout(async () => {
      try {
        // Use the 'api' instance from useAuth instead of raw axios
        const res = await api.get(`/auth/check-username`, {
          params: { username },
        });
        if (cancelled || checkIdRef.current !== checkId) return;
        setUsernameAvailable(Boolean(res.data.available));
      } catch (err) {
        if (!cancelled && checkIdRef.current === checkId) setUsernameAvailable(null);
      } finally {
        if (!cancelled && checkIdRef.current === checkId) setCheckingUsername(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [form.username]);

  // Submit Handler
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const username = (form.username || "").trim();
    if (!USERNAME_REGEX.test(username)) {
      setUsernameError("Invalid characters in username.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (usernameAvailable === false) {
      setError("Username is already taken.");
      return;
    }

    try {
      setLoading(true);

      if (inviteCode) {
        // 🟢 FLOW A: Register & Claim (Invite)
        await registerAndClaim({
          username,
          email: form.email,
          password: form.password,
          claimCode: inviteCode, // ✅ Pass the code
        });
        setSuccess("Profile claimed! Welcome to the family.");
        setTimeout(() => navigate("/dashboard"), 1500); // Go straight to tree
      } else {
        // 🟢 FLOW B: Standard Register -> Choose
        await signup({
          username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        setSuccess("Account created! Let's find your family...");
        setTimeout(() => navigate("/choose"), 1500); // Go to Choose Family page
      }

    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordMismatch =
    form.password && form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {inviteCode ? "Claim Your Profile" : "Create an Account"}
          </h2>
          {inviteCode && (
            <div className="mt-2 flex items-center justify-center text-sm text-indigo-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
              <FiGift className="mr-2" /> You are joining via an invite link
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
          <div className="space-y-4">
            
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 group-focus-within:text-indigo-500" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    usernameError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-colors outline-none`}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {checkingUsername ? (
                    <FiLoader className="animate-spin text-gray-400" />
                  ) : usernameAvailable === true ? (
                    <FiCheckCircle className="text-green-500" />
                  ) : usernameAvailable === false ? (
                    <FiXCircle className="text-red-500" />
                  ) : null}
                </div>
              </div>
              <div className="h-5 mt-1">
                {usernameError ? <p className="text-xs text-red-500">{usernameError}</p> : 
                 usernameAvailable === false ? <p className="text-xs text-red-500">Username taken</p> : 
                 usernameAvailable === true ? <p className="text-xs text-green-600">Username available</p> : null}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400 group-focus-within:text-indigo-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-colors outline-none"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 group-focus-within:text-indigo-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-colors outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 group-focus-within:text-indigo-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    passwordMismatch ? "border-red-300" : "border-gray-200"
                  } bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-colors outline-none`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {passwordMismatch && <p className="mt-1 text-xs text-red-500 animate-pulse">Passwords do not match</p>}
            </div>
          </div>

          <div className="text-center">
            {error && <div className="p-2 text-sm text-red-600 bg-red-50 rounded border border-red-100">{error}</div>}
            {success && <div className="p-2 text-sm text-green-600 bg-green-50 rounded border border-green-100">{success}</div>}
          </div>

          <button
            type="submit"
            disabled={loading || passwordMismatch || usernameAvailable === false || checkingUsername || Boolean(usernameError)}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center"><FiLoader className="animate-spin mr-2" /> {inviteCode ? "Claiming..." : "Creating Account..."}</span>
            ) : (
              inviteCode ? "Claim Profile" : "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}