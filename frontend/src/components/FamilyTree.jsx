import React, { useState, useCallback } from 'react';
import Tree from 'react-d3-tree';
import { FaPlus, FaMinus } from 'react-icons/fa';

// --- Sample Data Structure (The format required by react-d3-tree) ---
const familyData = {
  name: 'Dad & Mom (Root)',
  attributes: {
    photo: 'https://i.pravatar.cc/150?img=1', // Placeholder URL
    title: 'Head of Family',
  },
  children: [
    {
      name: 'Son A',
      attributes: { photo: 'https://i.pravatar.cc/150?img=2' },
      children: [
        {
          name: 'Grandchild X',
          attributes: { photo: 'https://i.pravatar.cc/150?img=3' },
        },
      ],
    },
    {
      name: 'Daughter B',
      attributes: { photo: 'https://i.pravatar.cc/150?img=4' },
      children: [
        {
          name: 'Grandchild Y',
          attributes: { photo: 'https://i.pravatar.cc/150?img=5' },
        },
        {
          name: 'Grandchild Z',
          attributes: { photo: 'https://i.pravatar.cc/150?img=6' },
        },
      ],
    },
  ],
};

// --- Custom Node Component for Circular Profile and Interactivity ---
const CustomFamilyNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Logic to determine if a node can be expanded/collapsed
  const canToggle = nodeDatum.children || nodeDatum._children;

  return (
    <g 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Circular Profile Picture */}
      <circle r={30} fill="#E5E7EB" stroke="#60A5FA" strokeWidth={2} />
      
      {/* 2. ForeignObject to embed HTML (Tailwind/Image) */}
      <foreignObject {...foreignObjectProps}>
        <div className="flex flex-col items-center">
          
          {/* Circular Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white -mt-10">
            <img 
              src={nodeDatum.attributes?.photo || 'https://i.pravatar.cc/150?img=7'}
              alt={nodeDatum.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Hover Name/Details Card (Appears on hover) */}
          {isHovered && (
            <div className="absolute top-0 mt-8 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 whitespace-nowrap">
              <p className="font-semibold text-sm text-gray-800">{nodeDatum.name}</p>
              {nodeDatum.attributes?.title && (
                <p className="text-xs text-blue-500">{nodeDatum.attributes.title}</p>
              )}
            </div>
          )}

          {/* More Option Button (Toggle) */}
          {canToggle && (
            <button
              onClick={() => {
                toggleNode();
                setIsHovered(false); // Hide hover card when expanding/collapsing
              }}
              className={`absolute -bottom-2 -right-2 p-1 rounded-full text-white ${nodeDatum.children ? 'bg-red-500' : 'bg-green-500'} transition duration-200 hover:scale-110 shadow-md`}
              aria-label={nodeDatum.children ? "Collapse children" : "Expand children"}
            >
              {nodeDatum.children ? <FaMinus size={12} /> : <FaPlus size={12} />}
            </button>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

// --- Main Family Tree Component ---
const FamilyTree = () => {
  // Define the properties for the ForeignObject which holds the HTML content
  const foreignObjectProps = { width: 60, height: 60, x: -30, y: -30 };

  return (
    <div className="w-full h-screen p-4 bg-gray-100 flex flex-col items-center">
      <h3 className="text-2xl font-bold text-gray-700 mb-4">Hierarchical Family Structure</h3>
      
      {/* Tree Container with fixed height/width */}
      <div id="treeWrapper" className="w-full h-full bg-white rounded-xl shadow-lg">
        <Tree
          data={familyData}
          orientation="vertical" // Display hierarchy top-down
          translate={{ x: 300, y: 50 }} // Initial position for the root node
          zoomable={true}
          collapsible={true}
          renderCustomNodeElement={(rd3tProps) => (
            <CustomFamilyNode {...rd3tProps} foreignObjectProps={foreignObjectProps} />
          )}
          nodeSize={{ x: 200, y: 150 }} // Spacing between nodes
          // Style the links (lines) between nodes
          pathFunc="step" // Use clean right-angle lines
          styles={{
            links: {
              stroke: '#9CA3AF', // Gray color for links
              strokeWidth: 2,
            },
          }}
        />
      </div>
    </div>
  );
};

export default FamilyTree;