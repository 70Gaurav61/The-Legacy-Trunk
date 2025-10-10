import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // For the password toggle
import { useAuth } from '../../services/useAuth';

/**
 * A sleek, modern Login Form Component using Tailwind CSS.
 */
const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            // Redirect to home or dashboard
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        // --- Main Container: Centers the login card ---
        <div className="flex items-center justify-center min-h-screen ">
            
            {/* --- Login Card --- */}
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-sm transform transition duration-500 hover:scale-[1.01]">
                
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Welcome Back 🚀
                </h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    
                    {/* Email Input */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            // Tailwind Classes for Input: Full width, padding, border, rounded, focus style
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    {/* Password Input with Toggle (Eye Button) */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            // Tailwind Classes for Input
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                        <span 
                            onClick={togglePasswordVisibility}
                            // Tailwind Classes for Eye Toggle: Absolute position, centering, cursor, color
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer hover:text-gray-600 transition duration-150"
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </span>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        // Tailwind Classes for Button: Full width, padding, primary color, hover effect, shadow
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="mt-6 text-center text-sm space-y-2">
                    {/* Forgot Password Link */}
                    <p className="text-gray-600">
                        Forgot your password? Click 
                        <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium ml-1 transition duration-150">
                            here
                        </a>
                    </p>
                    
                    {/* Sign Up Link */}
                    <p className="text-gray-600">
                        Do not have an account? Click 
                        <a href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium ml-1 transition duration-150">
                            Sign Up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;