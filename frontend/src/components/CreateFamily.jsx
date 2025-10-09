import React, { useState } from 'react';
import { FaUsers, FaTag, FaLock } from 'react-icons/fa'; // Icons for the form fields

/**
 * Component for creating a new Family Unit.
 * Gathers essential details like name, type, and privacy.
 */
const CreateFamily = () => {
    const [familyName, setFamilyName] = useState('');
    const [familyType, setFamilyType] = useState('nuclear'); // e.g., 'nuclear', 'extended', 'friends'
    const [isPrivate, setIsPrivate] = useState(true);

    const handleCreate = (e) => {
        e.preventDefault();
        // Add your API call/logic here to submit the new family data
        console.log('Creating Family:', { familyName, familyType, isPrivate });
        alert(`Family "${familyName}" is being created!`);
        // On success, navigate the user to the new family dashboard
    };

    return (
        // --- Main Container: Centered Layout ---
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            
            {/* --- Creation Card --- */}
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-lg">
                
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center border-b pb-4">
                    Set Up Your Family 🏡
                </h2>

                <form onSubmit={handleCreate} className="space-y-6">
                    
                    {/* 1. Family Name Input */}
                    <div className="space-y-1">
                        <label htmlFor="familyName" className="text-lg font-medium text-gray-700 flex items-center mb-1">
                            <FaUsers className="mr-2 text-blue-500" /> Family Name
                        </label>
                        <input
                            type="text"
                            id="familyName"
                            placeholder="e.g., The Smiths, My Best Buds"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    {/* 2. Family Type Dropdown (Select) */}
                    <div className="space-y-1">
                        <label htmlFor="familyType" className="text-lg font-medium text-gray-700 flex items-center mb-1">
                            <FaTag className="mr-2 text-blue-500" /> Family Type
                        </label>
                        <select
                            id="familyType"
                            value={familyType}
                            onChange={(e) => setFamilyType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none"
                        >
                            <option value="nuclear">Nuclear Family (Parents/Siblings)</option>
                            <option value="extended">Extended Family (Aunts/Uncles/Cousins)</option>
                            <option value="friends">Group of Friends/Roommates</option>
                            <option value="custom">Other/Custom</option>
                        </select>
                    </div>

                    {/* 3. Privacy Setting (Toggle) */}
                    <div className="space-y-1 pt-2">
                        <label className="text-lg font-medium text-gray-700 flex items-center justify-between cursor-pointer">
                            <span className="flex items-center">
                                <FaLock className="mr-2 text-blue-500" /> Private Group
                            </span>
                            
                            {/* Tailwind Toggle Switch */}
                            <div 
                                onClick={() => setIsPrivate(!isPrivate)} 
                                className={`relative inline-block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${isPrivate ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span 
                                    className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`}
                                ></span>
                            </div>
                        </label>
                        <p className="text-sm text-gray-500">
                            {isPrivate 
                                ? "Only invited members can join. (Recommended)" 
                                : "Anyone with the code can join."
                            }
                        </p>
                    </div>

                    {/* Create Button */}
                    <button 
                        type="submit" 
                        className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                    >
                        Create Family & Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFamily;