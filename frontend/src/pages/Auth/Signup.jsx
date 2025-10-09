import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // For the password toggle

/**
 * A sleek, modern Signup Form Component using Tailwind CSS.
 * Includes fields for Name, Email, Username, and a password toggle.
 */
const SignupComponent = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();
        // Add your signup/registration logic here, e.g., call an API
        console.log('Signing up with:', { name, email, username, password });
        alert(`Attempting to sign up new user: ${username}`);
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

                    {/* Username Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                        // Tailwind Classes for Button: Full width, padding, primary color, hover effect, shadow
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    {/* Already have an account? Link to Login */}
                    <p className="text-gray-600">
                        Already have an account? 
                        <a href="/auth/login" className="text-green-600 hover:text-green-800 font-medium ml-1 transition duration-150">
                            Log In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupComponent;