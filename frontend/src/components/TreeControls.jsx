import React from "react";
import { FiArrowUp, FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";

export default function TreeControls({
  viewMode,
  setViewMode,
  upLevels,
  setUpLevels,
  downLevels,
  setDownLevels,
  zoom,
  setZoom,
  fetchData
}) {
  return (
    <div className="bg-white z-40 px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">View</span>
          <div className="flex bg-gray-100/50 p-1 rounded-lg border border-gray-200">
              <button onClick={() => setViewMode("current")} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === "current" ? "bg-white shadow-sm text-indigo-600 border border-gray-100" : "text-gray-500 hover:text-gray-700"}`}>My Focus</button>
              <button onClick={() => setViewMode("whole")} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === "whole" ? "bg-white shadow-sm text-indigo-600 border border-gray-100" : "text-gray-500 hover:text-gray-700"}`}>Full Tree</button>
          </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
           <div className={`flex items-center gap-2 ${viewMode === "whole" ? "opacity-30 pointer-events-none" : ""}`}>
              <FiArrowUp className="text-gray-400"/> 
              <span className="text-gray-500">Ancestors:</span>
              <input type="number" min="0" max="5" value={upLevels} onChange={(e) => setUpLevels(Number(e.target.value))} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center focus:outline-none focus:border-indigo-400"/>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-gray-500">Descendants:</span>
              <input type="number" min="1" max="5" value={downLevels} onChange={(e) => setDownLevels(Number(e.target.value))} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center focus:outline-none focus:border-indigo-400"/>
           </div>
           <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 hover:bg-gray-50 text-gray-500"><FiZoomOut /></button>
              <span className="w-12 text-center text-xs font-mono text-gray-400 border-x border-gray-100 py-2">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-gray-50 text-gray-500"><FiZoomIn /></button>
              <button onClick={() => {setZoom(1); fetchData();}} className="p-2 hover:bg-gray-50 text-indigo-500 border-l border-gray-100"><FiRefreshCw /></button>
           </div>
      </div>
    </div>
  );
}