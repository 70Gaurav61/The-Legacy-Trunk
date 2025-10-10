import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // For the password toggle
import { useAuth } from '../../services/useAuth';

/**
 * A sleek, modern Signup Form Component using Tailwind CSS.
 * Includes fields for Name, Email, and Password.
 */
const Signup = () => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(name, email, password);
            // Redirect to home or dashboard
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        // --- Main Container: Centers the signup card ---
        <div className="flex items-center justify-center min-h-screen p-4">
            
            {/* --- Signup Card --- */}
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition duration-500 hover:scale-[1.01]">
                
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Create Your Account 🎉
                </h2>

                <form onSubmit={handleSignup} className="space-y-5">
                    
                    {/* Full Name Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                        />
                        <span 
                            onClick={togglePasswordVisibility}
                            // Styling for Eye Toggle
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer hover:text-gray-600 transition duration-150"
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </span>
                    </div>

                    {/* Sign Up Button (Using a green accent color for registration/creation) */}
                    <button
                        type="submit"
                        disabled={loading}
                        // Tailwind Classes for Button: Full width, padding, primary color, hover effect, shadow
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="mt-6 text-center text-sm">
                    {/* Already have an account? Link to Login */}
                    <p className="text-gray-600">
                        Already have an account? 
                        <a href="/login" className="text-green-600 hover:text-green-800 font-medium ml-1 transition duration-150">
                            Log In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;