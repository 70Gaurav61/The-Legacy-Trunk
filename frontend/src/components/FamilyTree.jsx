// import React, { useState } from 'react';
// import Tree from 'react-d3-tree';
// import { FaPlus, FaMinus, FaEllipsisH } from 'react-icons/fa'; // Added FaEllipsisH for 'More' options

// // --- Revised Sample Data Structure ---
// const familyDataComplex = {
//   name: 'Family Tree Root', // This is a dummy root node for d3-tree
//   children: [
//     {
//       name: 'John & Jane Doe', // Display name for the couple node
//       attributes: {
//         father: { id: 'p1', name: 'John Doe', photo: 'https://i.pravatar.cc/150?img=1' },
//         mother: { id: 'p2', name: 'Jane Doe', photo: 'https://i.pravatar.cc/150?img=2' },
//         generation: 0, // Helps with rendering/logic if needed
//       },
//       children: [
//         {
//           name: 'Peter & Mary Doe',
//           attributes: {
//             father: { id: 'p3', name: 'Peter Doe', photo: 'https://i.pravatar.cc/150?img=3' },
//             mother: { id: 'p4', name: 'Mary Doe', photo: 'https://i.pravatar.cc/150?img=4' },
//             generation: 1,
//           },
//           children: [
//             {
//               name: 'Tim & Tina Doe',
//               attributes: {
//                 father: { id: 'p5', name: 'Tim Doe', photo: 'https://i.pravatar.cc/150?img=5' },
//                 mother: { id: 'p6', name: 'Tina Doe', photo: 'https://i.pravatar.cc/150?img=6' },
//                 generation: 2,
//               },
//             }
//           ]
//         },
//         {
//           name: 'Mark & Emily Smith',
//           attributes: {
//             father: { id: 'p7', name: 'Mark Smith', photo: 'https://i.pravatar.cc/150?img=7' },
//             mother: { id: 'p8', name: 'Emily Doe', photo: 'https://i.pravatar.cc/150?img=8' },
//             generation: 1,
//           },
//           _children: [ // Example of collapsed children
//             {
//               name: 'Tom & Sarah Jones',
//               attributes: {
//                 father: { id: 'p9', name: 'Tom Jones', photo: 'https://i.pravatar.cc/150?img=9' },
//                 mother: { id: 'p10', name: 'Sarah Smith', photo: 'https://i.pravatar.cc/150?img=10' },
//                 generation: 2,
//               },
//             }
//           ]
//         },
//       ],
//     },
//   ],
// };

// // --- Custom Node Component for Couple Profiles and Interactivity ---
// const CustomCoupleNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => {
//   const [hoveredPerson, setHoveredPerson] = useState(null); // 'father', 'mother', or null
//   const [showMoreOptions, setShowMoreOptions] = useState(false); // For the More... dropdown
  
//   // Only render if nodeDatum has father/mother attributes (skip the dummy root)
//   if (!nodeDatum.attributes?.father && !nodeDatum.attributes?.mother) {
//       return null; // Don't render dummy root node visually
//   }

//   const { father, mother } = nodeDatum.attributes;
//   const hasChildren = nodeDatum.children || nodeDatum._children;

//   // Define the effective width/height of the foreignObject (larger to accommodate two circles and buttons)
//   const nodeWidth = 160; 
//   const nodeHeight = 80;

//   return (
//     <g>
//       {/* ForeignObject to embed HTML/Tailwind content for the couple node */}
//       <foreignObject {...foreignObjectProps}>
//         <div className="flex items-center justify-center w-full h-full relative p-2 bg-white rounded-lg shadow-md border-2 border-gray-200">
          
//           {/* Father's Profile */}
//           <div 
//             className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-blue-400 group flex-shrink-0"
//             onMouseEnter={() => setHoveredPerson('father')}
//             onMouseLeave={() => setHoveredPerson(null)}
//           >
//             <img 
//               src={father?.photo || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=F'} 
//               alt={father?.name || 'Father'} 
//               className="w-full h-full object-cover"
//             />
//             {hoveredPerson === 'father' && (
//               <div className="absolute bottom-full mb-1 p-1 bg-blue-500 text-white text-xs rounded shadow-lg whitespace-nowrap left-1/2 transform -translate-x-1/2">
//                 {father?.name}
//               </div>
//             )}
//           </div>

//           {/* Separator / Gap */}
//           <div className="w-4 h-full bg-transparent flex-shrink-0"></div> 

//           {/* Mother's Profile */}
//           <div 
//             className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-pink-400 group flex-shrink-0"
//             onMouseEnter={() => setHoveredPerson('mother')}
//             onMouseLeave={() => setHoveredPerson(null)}
//           >
//             <img 
//               src={mother?.photo || 'https://via.placeholder.com/150/FF69B4/FFFFFF?text=M'} 
//               alt={mother?.name || 'Mother'} 
//               className="w-full h-full object-cover"
//             />
//             {hoveredPerson === 'mother' && (
//               <div className="absolute bottom-full mb-1 p-1 bg-pink-500 text-white text-xs rounded shadow-lg whitespace-nowrap left-1/2 transform -translate-x-1/2">
//                 {mother?.name}
//               </div>
//             )}
//           </div>
          
//           {/* More Options Button (for adding child/spouse, etc.) */}
//           <button
//             onClick={(e) => { e.stopPropagation(); setShowMoreOptions(!showMoreOptions); }}
//             className="absolute top-1 right-1 bg-gray-200 hover:bg-gray-300 rounded-full p-1 text-gray-700 text-xs transition duration-200 shadow-sm"
//           >
//             <FaEllipsisH size={10} />
//           </button>

//           {/* More Options Dropdown */}
//           {showMoreOptions && (
//             <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-30">
//               <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Child</button>
//               <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Sibling</button>
//               {/* Add more options like "Edit Couple", "Delete Couple" etc. */}
//             </div>
//           )}

//           {/* Toggle Children Button (positioned at the bottom center to extend down) */}
//           {hasChildren && (
//             <button
//               onClick={(e) => { e.stopPropagation(); toggleNode(); setShowMoreOptions(false); }}
//               className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full p-1 rounded-full text-white ${nodeDatum.children ? 'bg-red-500' : 'bg-green-500'} transition duration-200 hover:scale-110 shadow-md focus:outline-none`}
//               aria-label={nodeDatum.children ? "Collapse children" : "Expand children"}
//             >
//               {nodeDatum.children ? <FaMinus size={12} /> : <FaPlus size={12} />}
//             </button>
//           )}

//         </div>
//       </foreignObject>
//     </g>
//   );
// };

// // --- Main Family Tree Component ---
// const FamilyTreeViewer = () => {
//   // CORRECTED foreignObjectProps for a wider node representing a couple
//   const nodeWidth = 160; // Total width for the couple box
//   const nodeHeight = 80;  // Total height for the couple box
//   const foreignObjectProps = { 
//     width: nodeWidth, 
//     height: nodeHeight, 
//     x: -nodeWidth / 2, // Center the foreignObject horizontally
//     y: -nodeHeight / 2 // Center the foreignObject vertically
//   }; 

//   return (
//     <div className="w-full h-screen p-4 bg-gray-100 flex flex-col items-center">
//       <h3 className="text-2xl font-bold text-gray-700 mb-4">Hierarchical Family Structure</h3>
      
//       <div id="treeWrapper" className="w-full h-full bg-white rounded-xl shadow-lg">
//         <Tree
//           data={familyDataComplex}
//           orientation="vertical"
//           translate={{ x: 400, y: 100 }} // Adjust initial translation for wider nodes
//           zoomable={true}
//           collapsible={true}
//           // Render only custom nodes for actual couple data, skipping the dummy root
//           renderCustomNodeElement={(rd3tProps) => {
//               if (rd3tProps.nodeDatum.name === 'Family Tree Root') {
//                   return null; // Don't render the dummy root visually
//               }
//               return <CustomCoupleNode {...rd3tProps} foreignObjectProps={foreignObjectProps} />;
//           }}
//           // Adjusted node spacing for wider couple nodes
//           nodeSize={{ x: 280, y: 150 }} 
//           pathFunc="step"
//           styles={{
//             links: {
//               stroke: '#9CA3AF',
//               strokeWidth: 2,
//             },
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default FamilyTreeViewer;


import React, { useState, useMemo } from "react";

// FamilyTreeComponent.jsx
// Enhanced version with viewport (focus on a user node) and overflow/zoom handling.
// New: two view modes — "current user" (viewported) and "whole tree" (root-based full tree).
// Tailwind CSS recommended but not required — plain classes work too.

// Data model for a person-node:
// {
//   id: string,
//   male: { name: string | null },
//   female: { name: string | null },
//   children: [ node, ... ]
// }

const sampleData = {
  id: "root",
  male: { name: "John" },
  female: { name: "Jane" },
  children: [
    {
      id: "a",
      male: { name: "Alex" },
      female: { name: null },
      children: [],
    },
    {
      id: "b",
      male: { name: "Sam" },
      female: { name: "Sara" },
      children: [
        {
          id: "b1",
          male: { name: "Paul" },
          female: { name: "Paula" },
          children: [
            {
              id: "b1a",
              male: { name: "Kid1" },
              female: { name: null },
              children: [],
            },
            {
              id: "b1b",
              male: { name: null },
              female: { name: "Kid2" },
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "c",
      male: { name: null },
      female: { name: "Liza" },
      children: [],
    },
  ],
};

function uid(prefix = "n") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export default function FamilyTree() {
  const [tree, setTree] = useState(sampleData);
  // View mode: 'current' => viewport around focal user, 'whole' => show entire tree from oldest member
  const [viewMode, setViewMode] = useState("current");
  // Focal node (simulate "current logged user")
  const [focalId, setFocalId] = useState(tree.id);
  const [zoom, setZoom] = useState(1);
  const [upLevels, setUpLevels] = useState(2);
  const [downLevels, setDownLevels] = useState(2);

  // Build parent map and flat list of nodes for UI selection
  const { parentMap, nodesById, allNodesList } = useMemo(() => {
    const parentMap = new Map();
    const nodesById = new Map();
    const all = [];
    function dfs(node, parent = null) {
      nodesById.set(node.id, node);
      all.push(node);
      if (parent) parentMap.set(node.id, parent.id);
      (node.children || []).forEach((c) => dfs(c, node));
    }
    dfs(tree, null);
    return {
      parentMap,
      nodesById,
      allNodesList: all.map((n) => ({ id: n.id, label: nodeLabel(n) })),
    };
  }, [tree]);

  function nodeLabel(n) {
    const m = n.male?.name || "";
    const f = n.female?.name || "";
    const name = m || f || "(no name)";
    return `${name} — ${n.id}`;
  }

  // Helpers to compute viewport nodes: ancestors up to N, descendants down to M
  const getAncestors = (id, maxLevels) => {
    const res = [];
    let cur = id;
    for (let i = 0; i < maxLevels; i++) {
      const p = parentMap.get(cur);
      if (!p) break;
      res.push(p);
      cur = p;
    }
    return res;
  };

  const getDescendants = (startId, maxDepth) => {
    const res = new Set();
    const q = [{ id: startId, depth: 0 }];
    while (q.length) {
      const { id, depth } = q.shift();
      if (depth > 0) res.add(id);
      if (depth === maxDepth) continue;
      const node = nodesById.get(id);
      if (!node) continue;
      (node.children || []).forEach((c) => q.push({ id: c.id, depth: depth + 1 }));
    }
    return Array.from(res);
  };

  // Build set of allowed node ids for the viewport. If viewMode === 'whole' we don't prune (show all)
  const allowedSet = useMemo(() => {
    if (viewMode === "whole") return null; // null means "no pruning" — show full tree

    if (!focalId || !nodesById.has(focalId)) return new Set([tree.id]);
    const set = new Set();
    set.add(focalId);
    const ancestors = getAncestors(focalId, upLevels);
    ancestors.forEach((a) => set.add(a));
    const descendants = getDescendants(focalId, downLevels);
    descendants.forEach((d) => set.add(d));
    return set;
  }, [viewMode, focalId, parentMap, nodesById, upLevels, downLevels, tree.id]);

  // Produce a pruned clone of the original tree that contains only allowed ids; if allowedSet is null -> full tree
  const prunedTree = useMemo(() => {
    if (viewMode === "whole") return tree; // show full tree

    function cloneIfAllowed(node) {
      if (!allowedSet.has(node.id)) return null;
      const c = { ...node, children: [] };
      for (let child of node.children || []) {
        const cc = cloneIfAllowed(child);
        if (cc) c.children.push(cc);
      }
      return c;
    }

    if (!nodesById.has(focalId)) return cloneIfAllowed(tree);

    // find highest ancestor in allowed set to use as visible root (so connectors look correct)
    let top = focalId;
    while (true) {
      const p = parentMap.get(top);
      if (!p || !allowedSet.has(p)) break;
      top = p;
    }
    // try to clone the overall tree, but if that yields nothing, clone top
    const fullClone = cloneIfAllowed(tree);
    return fullClone || cloneIfAllowed(nodesById.get(top)) || null;
  }, [allowedSet, tree, nodesById, parentMap, focalId, viewMode]);

  const updateTree = (updater) => {
    setTree((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      updater(copy);
      return copy;
    });
  };

  const addSpouse = (nodeId, genderToAdd) => {
    const name = window.prompt(`Enter ${genderToAdd} name to add:`);
    if (!name) return;
    updateTree((root) => {
      const res = findNode(root, nodeId);
      if (!res) return;
      const target = res.node;
      if (genderToAdd === "female") target.female.name = name;
      else target.male.name = name;
    });
  };

  const addChild = (nodeId) => {
    const childName = window.prompt("Enter child name:");
    if (!childName) return;
    const gender = window.prompt("Enter child gender (m/f):", "m");
    const child = {
      id: uid("c"),
      male: { name: gender === "m" ? childName : null },
      female: { name: gender === "f" ? childName : null },
      children: [],
    };
    updateTree((root) => {
      const res = findNode(root, nodeId);
      if (!res) return;
      res.node.children = res.node.children || [];
      res.node.children.push(child);
    });
  };

  // helper to find node by id (mutable traversal) — used by updateTree actions
  const findNode = (node, id, parent = null) => {
    if (node.id === id) return { node, parent };
    for (let child of node.children || []) {
      const res = findNode(child, id, node);
      if (res) return res;
    }
    return null;
  };

  const renderPersonCircle = (person, isMale, onAddSpouse) => {
    const present = !!person?.name;
    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-medium select-none ${
            isMale ? "border-blue-600" : "border-pink-600"
          }`}
        >
          {present ? (
            <span className="text-sm truncate px-1">{person.name}</span>
          ) : (
            <button
              onClick={onAddSpouse}
              title={isMale ? "Add husband" : "Add wife"}
              className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <path
                  fill="currentColor"
                  d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-1 text-[10px] text-gray-600">
          {present ? (isMale ? "Male" : "Female") : "Add"}
        </div>
      </div>
    );
  };

  // Render a single couple-node and its children recursively
  const Node = ({ node }) => {
    return (
      <div className="flex flex-col items-center relative min-w-[140px]">
        {/* Node box: two circles side by side */}
        <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
          {renderPersonCircle(node.male, true, () => addSpouse(node.id, "male"))}
          {renderPersonCircle(node.female, false, () => addSpouse(node.id, "female"))}
        </div>

        {/* Add child button */}
        <button
          onClick={() => addChild(node.id)}
          className="mt-2 text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100"
        >
          + Add child
        </button>

        {/* Connector to children */}
        {node.children && node.children.length > 0 && (
          <div className="w-full flex flex-col items-center mt-3">
            {/* vertical line down */}
            <div className="w-px h-4 bg-gray-400" />
            {/* horizontal splitter */}
            <div className="w-full flex items-start justify-center mt-1">
              <div className="w-full h-px bg-gray-400" />
            </div>

            {/* children row */}
            <div className="w-full flex items-start justify-center mt-3 space-x-6">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* vertical line up to child */}
                  <div className="w-px h-4 bg-gray-400" />
                  <Node node={child} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // UI controls
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm">View Mode:</label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="viewMode"
              value="current"
              checked={viewMode === "current"}
              onChange={() => setViewMode("current")}
            />
            <span className="text-sm">By current user</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="viewMode"
              value="whole"
              checked={viewMode === "whole"}
              onChange={() => {
                setViewMode("whole");
                // when switching to whole, focus must be root (oldest member)
                setFocalId(tree.id);
              }}
            />
            <span className="text-sm">Whole tree (oldest member)</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm">Focus:</label>
            <select
              value={focalId}
              onChange={(e) => setFocalId(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
              disabled={viewMode === "whole"}
            >
              {allNodesList.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Up</label>
          <input
            type="number"
            min={0}
            max={5}
            value={viewMode === "whole" ? 0 : upLevels}
            onChange={(e) => setUpLevels(Number(e.target.value))}
            className="w-14 border px-2 py-1 rounded text-sm"
            disabled={viewMode === "whole"}
            title={viewMode === "whole" ? "Disabled when viewing whole tree (no ancestor above oldest member)" : "Number of ancestor levels to show"}
          />
          <label className="text-sm">Down</label>
          <input
            type="number"
            min={0}
            max={5}
            value={downLevels}
            onChange={(e) => setDownLevels(Number(e.target.value))}
            className="w-14 border px-2 py-1 rounded text-sm"
          />
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
              className="px-2 py-1 border rounded"
            >
              −
            </button>
            <div className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</div>
            <button
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
              className="px-2 py-1 border rounded"
            >
              +
            </button>
            <button onClick={() => setZoom(1)} className="px-2 py-1 border rounded ml-2">
              reset
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable canvas area that handles overflow in both directions. We also apply scaling. */}
      <div
        className="border rounded overflow-auto bg-white"
        style={{ width: "100%", height: "60vh" }}
      >
        <div
          className="flex justify-center py-6"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <div className="min-w-[300px]">
            {prunedTree ? <Node node={prunedTree} /> : <div className="p-4">Nothing to show</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Two view modes are available:
        <ul className="list-disc ml-5 mt-1">
          <li>
            <strong>By current user</strong> — viewported: shows the selected user and up to the specified
            ancestor/descendant levels (useful to avoid rendering huge trees).
          </li>
          <li>
            <strong>Whole tree</strong> — shows the full family tree from the oldest member (root). The
            <em>Up</em> control and Focus selector are disabled in this mode because there are no
            ancestors above the oldest member.
          </li>
        </ul>
      </div>
    </div>
  );
}
