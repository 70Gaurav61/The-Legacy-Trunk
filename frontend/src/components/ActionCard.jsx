// src/components/ActionCard.js

import React from 'react';

function ActionCard({ title, icon, bgColor }) {
  return (
    <button 
      className={`
        w-full p-6 h-40 flex flex-col items-start justify-between rounded-xl text-white 
        shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 
        ${bgColor}
      `}
    >
      <div className="text-xl font-bold text-left leading-snug">
        {title}
      </div>
      <div className="text-opacity-90">
        {icon}
      </div>
    </button>
  );
}
export default ActionCard;