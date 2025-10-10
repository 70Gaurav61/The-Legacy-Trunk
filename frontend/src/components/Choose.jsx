import React from 'react';

/**
 * A page component shown after successful signup, offering options to
 * create a new family or join an existing one.
 */
const Choose = () => {
    // You would typically navigate to different routes based on the user's choice
    const handleCreateFamily = () => {
        console.log('Navigating to Create Family page...');
        // Example: router.push('/create-family');
        alert('Navigating to Create Family...');
    };

    const handleJoinFamily = () => {
        console.log('Navigating to Join Family page...');
        // Example: router.push('/join-family');
        alert('Navigating to Join Family...');
    };

    return (
        // --- Main Container: Centers the content vertically and horizontally ---
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
            
            {/* --- Options Card --- */}
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-3xl w-full max-w-2xl text-center">
                
                <h2 className="text-4xl font-extrabold text-gray-800 mb-6 md:mb-8 animate-fade-in">
                    Welcome Aboard! 🎉
                </h2>
                <p className="text-lg text-gray-600 mb-8 md:mb-10 max-w-prose mx-auto animate-fade-in-delay">
                    What would you like to do first?
                </p>

                {/* --- Options Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* Option 1: Create a Family */}
                    <div 
                        onClick={handleCreateFamily}
                        className="group bg-green-500 hover:bg-green-600 text-white rounded-xl p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-teal-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <span role="img" aria-label="family-icon" className="text-6xl mb-4 block group-hover:animate-bounce">
                                🏡
                            </span>
                            <h3 className="text-3xl font-bold mb-2">Create a Family</h3>
                            <p className="text-green-100 text-sm">
                                Start a new family unit and invite members.
                            </p>
                        </div>
                    </div>

                    {/* Option 2: Join Family */}
                    <div 
                        onClick={handleJoinFamily}
                        className="group bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <span role="img" aria-label="join-icon" className="text-6xl mb-4 block group-hover:animate-bounce">
                                👋
                            </span>
                            <h3 className="text-3xl font-bold mb-2">Join a Family</h3>
                            <p className="text-purple-100 text-sm">
                                Enter a code to join an existing family.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Choose;