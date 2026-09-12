import React, { useState } from "react";
import { FiImage, FiClock, FiPackage } from "react-icons/fi";
import CreateStory from "../components/CreateStory"; // Your standard Story component
import TimeCapsule from "../components/TimeCapsule"; // Your Time Capsule component

export default function CreatePost() {
  const [activeMode, setActiveMode] = useState("story"); // 'story' | 'capsule'

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      
      {/* 🟢 TOGGLE HEADER */}
      <div className="mb-8 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900">
          {activeMode === "story" ? "Create New Story" : "Time Capsule Vault"}
        </h1>
        
        {/* The Switcher UI */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center shadow-inner relative">
            {/* Sliding Background (Optional visual flair) */}
            <div 
                className={`absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md transition-all duration-300 ease-in-out w-[140px]
                ${activeMode === "story" ? "left-1.5" : "left-[148px]"}`}
            />

            <button 
                onClick={() => setActiveMode("story")}
                className={`relative z-10 flex items-center justify-center gap-2 w-[140px] py-3 rounded-xl text-sm font-bold transition-colors 
                ${activeMode === "story" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            >
                <FiImage size={18}/> Story
            </button>
            <button 
                onClick={() => setActiveMode("capsule")}
                className={`relative z-10 flex items-center justify-center gap-2 w-[140px] py-3 rounded-xl text-sm font-bold transition-colors 
                ${activeMode === "capsule" ? "text-orange-600" : "text-gray-500 hover:text-gray-700"}`}
            >
                <FiPackage size={18}/> Capsule
            </button>
        </div>
        
        <p className="text-gray-500 text-sm">
             {activeMode === "story" 
                ? "Share a memory with your family today." 
                : "Send a message to the future. Locked until the date you choose."}
        </p>
      </div>

      {/* 🟢 CONDITIONAL RENDERING */}
      <div className="transition-all duration-500">
        {activeMode === "story" ? (
            <div className="animate-slideUp">
                {/* We pass a prop 'isEmbedded' if you want to hide the header inside CreateStory, optional */}
                <CreateStory /> 
            </div>
        ) : (
            <div className="animate-slideUp">
                <TimeCapsule />
            </div>
        )}
      </div>
    </div>
  );
}