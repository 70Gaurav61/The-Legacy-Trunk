

// import React, { useState, useMemo } from "react";

// // FamilyTreeComponent.jsx
// // Enhanced version with viewport (focus on a user node) and overflow/zoom handling.
// // New: two view modes — "current user" (viewported) and "whole tree" (root-based full tree).
// // Tailwind CSS recommended but not required — plain classes work too.

// // Data model for a person-node:
// // {
// //   id: string,
// //   male: { name: string | null },
// //   female: { name: string | null },
// //   children: [ node, ... ]
// // }

// const sampleData = {
//   id: "root",
//   male: { name: "John" },
//   female: { name: "Jane" },
//   children: [
//     {
//       id: "a",
//       male: { name: "Alex" },
//       female: { name: null },
//       children: [],
//     },
//     {
//       id: "b",
//       male: { name: "Sam" },
//       female: { name: "Sara" },
//       children: [
//         {
//           id: "b1",
//           male: { name: "Paul" },
//           female: { name: "Paula" },
//           children: [
//             {
//               id: "b1a",
//               male: { name: "Kid1" },
//               female: { name: null },
//               children: [],
//             },
//             {
//               id: "b1b",
//               male: { name: null },
//               female: { name: "Kid2" },
//               children: [],
//             },
//           ],
//         },
//       ],
//     },
//     {
//       id: "c",
//       male: { name: null },
//       female: { name: "Liza" },
//       children: [],
//     },
//   ],
// };

// function uid(prefix = "n") {
//   return prefix + Math.random().toString(36).slice(2, 9);
// }

// export default function FamilyTree() {
//   const [tree, setTree] = useState(sampleData);
//   // View mode: 'current' => viewport around focal user, 'whole' => show entire tree from oldest member
//   const [viewMode, setViewMode] = useState("current");
//   // Focal node (simulate "current logged user")
//   const [focalId, setFocalId] = useState(tree.id);
//   const [zoom, setZoom] = useState(1);
//   const [upLevels, setUpLevels] = useState(2);
//   const [downLevels, setDownLevels] = useState(2);

//   // Build parent map and flat list of nodes for UI selection
//   const { parentMap, nodesById, allNodesList } = useMemo(() => {
//     const parentMap = new Map();
//     const nodesById = new Map();
//     const all = [];
//     function dfs(node, parent = null) {
//       nodesById.set(node.id, node);
//       all.push(node);
//       if (parent) parentMap.set(node.id, parent.id);
//       (node.children || []).forEach((c) => dfs(c, node));
//     }
//     dfs(tree, null);
//     return {
//       parentMap,
//       nodesById,
//       allNodesList: all.map((n) => ({ id: n.id, label: nodeLabel(n) })),
//     };
//   }, [tree]);

//   function nodeLabel(n) {
//     const m = n.male?.name || "";
//     const f = n.female?.name || "";
//     const name = m || f || "(no name)";
//     return `${name} — ${n.id}`;
//   }

//   // Helpers to compute viewport nodes: ancestors up to N, descendants down to M
//   const getAncestors = (id, maxLevels) => {
//     const res = [];
//     let cur = id;
//     for (let i = 0; i < maxLevels; i++) {
//       const p = parentMap.get(cur);
//       if (!p) break;
//       res.push(p);
//       cur = p;
//     }
//     return res;
//   };

//   const getDescendants = (startId, maxDepth) => {
//     const res = new Set();
//     const q = [{ id: startId, depth: 0 }];
//     while (q.length) {
//       const { id, depth } = q.shift();
//       if (depth > 0) res.add(id);
//       if (depth === maxDepth) continue;
//       const node = nodesById.get(id);
//       if (!node) continue;
//       (node.children || []).forEach((c) => q.push({ id: c.id, depth: depth + 1 }));
//     }
//     return Array.from(res);
//   };

//   // Build set of allowed node ids for the viewport. If viewMode === 'whole' we don't prune (show all)
//   const allowedSet = useMemo(() => {
//     if (viewMode === "whole") return null; // null means "no pruning" — show full tree

//     if (!focalId || !nodesById.has(focalId)) return new Set([tree.id]);
//     const set = new Set();
//     set.add(focalId);
//     const ancestors = getAncestors(focalId, upLevels);
//     ancestors.forEach((a) => set.add(a));
//     const descendants = getDescendants(focalId, downLevels);
//     descendants.forEach((d) => set.add(d));
//     return set;
//   }, [viewMode, focalId, parentMap, nodesById, upLevels, downLevels, tree.id]);

//   // Produce a pruned clone of the original tree that contains only allowed ids; if allowedSet is null -> full tree
//   const prunedTree = useMemo(() => {
//     if (viewMode === "whole") return tree; // show full tree

//     function cloneIfAllowed(node) {
//       if (!allowedSet.has(node.id)) return null;
//       const c = { ...node, children: [] };
//       for (let child of node.children || []) {
//         const cc = cloneIfAllowed(child);
//         if (cc) c.children.push(cc);
//       }
//       return c;
//     }

//     if (!nodesById.has(focalId)) return cloneIfAllowed(tree);

//     // find highest ancestor in allowed set to use as visible root (so connectors look correct)
//     let top = focalId;
//     while (true) {
//       const p = parentMap.get(top);
//       if (!p || !allowedSet.has(p)) break;
//       top = p;
//     }
//     // try to clone the overall tree, but if that yields nothing, clone top
//     const fullClone = cloneIfAllowed(tree);
//     return fullClone || cloneIfAllowed(nodesById.get(top)) || null;
//   }, [allowedSet, tree, nodesById, parentMap, focalId, viewMode]);

//   const updateTree = (updater) => {
//     setTree((prev) => {
//       const copy = JSON.parse(JSON.stringify(prev));
//       updater(copy);
//       return copy;
//     });
//   };

//   const addSpouse = (nodeId, genderToAdd) => {
//     const name = window.prompt(`Enter ${genderToAdd} name to add:`);
//     if (!name) return;
//     updateTree((root) => {
//       const res = findNode(root, nodeId);
//       if (!res) return;
//       const target = res.node;
//       if (genderToAdd === "female") target.female.name = name;
//       else target.male.name = name;
//     });
//   };

//   const addChild = (nodeId) => {
//     const childName = window.prompt("Enter child name:");
//     if (!childName) return;
//     const gender = window.prompt("Enter child gender (m/f):", "m");
//     const child = {
//       id: uid("c"),
//       male: { name: gender === "m" ? childName : null },
//       female: { name: gender === "f" ? childName : null },
//       children: [],
//     };
//     updateTree((root) => {
//       const res = findNode(root, nodeId);
//       if (!res) return;
//       res.node.children = res.node.children || [];
//       res.node.children.push(child);
//     });
//   };

//   // helper to find node by id (mutable traversal) — used by updateTree actions
//   const findNode = (node, id, parent = null) => {
//     if (node.id === id) return { node, parent };
//     for (let child of node.children || []) {
//       const res = findNode(child, id, node);
//       if (res) return res;
//     }
//     return null;
//   };

//   const renderPersonCircle = (person, isMale, onAddSpouse) => {
//     const present = !!person?.name;
//     return (
//       <div className="flex flex-col items-center">
//         <div
//           className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-medium select-none ${
//             isMale ? "border-blue-600" : "border-pink-600"
//           }`}
//         >
//           {present ? (
//             <span className="text-sm truncate px-1">{person.name}</span>
//           ) : (
//             <button
//               onClick={onAddSpouse}
//               title={isMale ? "Add husband" : "Add wife"}
//               className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 className="w-4 h-4"
//               >
//                 <path
//                   fill="currentColor"
//                   d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z"
//                 />
//               </svg>
//             </button>
//           )}
//         </div>
//         <div className="mt-1 text-[10px] text-gray-600">
//           {present ? (isMale ? "Male" : "Female") : "Add"}
//         </div>
//       </div>
//     );
//   };

//   // Render a single couple-node and its children recursively
//   const Node = ({ node }) => {
//     return (
//       <div className="flex flex-col items-center relative min-w-[140px]">
//         {/* Node box: two circles side by side */}
//         <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
//           {renderPersonCircle(node.male, true, () => addSpouse(node.id, "male"))}
//           {renderPersonCircle(node.female, false, () => addSpouse(node.id, "female"))}
//         </div>

//         {/* Add child button */}
//         <button
//           onClick={() => addChild(node.id)}
//           className="mt-2 text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100"
//         >
//           + Add child
//         </button>

//         {/* Connector to children */}
//         {node.children && node.children.length > 0 && (
//           <div className="w-full flex flex-col items-center mt-3">
//             {/* vertical line down */}
//             <div className="w-px h-4 bg-gray-400" />
//             {/* horizontal splitter */}
//             <div className="w-full flex items-start justify-center mt-1">
//               <div className="w-full h-px bg-gray-400" />
//             </div>

//             {/* children row */}
//             <div className="w-full flex items-start justify-center mt-3 space-x-6">
//               {node.children.map((child) => (
//                 <div key={child.id} className="flex flex-col items-center">
//                   {/* vertical line up to child */}
//                   <div className="w-px h-4 bg-gray-400" />
//                   <Node node={child} />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // UI controls
//   return (
//     <div className="p-4">
//       <div className="flex items-center justify-between mb-4 gap-4">
//         <div className="flex items-center gap-4">
//           <label className="text-sm">View Mode:</label>
//           <label className="inline-flex items-center gap-2">
//             <input
//               type="radio"
//               name="viewMode"
//               value="current"
//               checked={viewMode === "current"}
//               onChange={() => setViewMode("current")}
//             />
//             <span className="text-sm">By current user</span>
//           </label>
//           <label className="inline-flex items-center gap-2">
//             <input
//               type="radio"
//               name="viewMode"
//               value="whole"
//               checked={viewMode === "whole"}
//               onChange={() => {
//                 setViewMode("whole");
//                 // when switching to whole, focus must be root (oldest member)
//                 setFocalId(tree.id);
//               }}
//             />
//             <span className="text-sm">Whole tree (oldest member)</span>
//           </label>

//           <div className="flex items-center gap-2">
//             <label className="text-sm">Focus:</label>
//             <select
//               value={focalId}
//               onChange={(e) => setFocalId(e.target.value)}
//               className="border px-2 py-1 rounded text-sm"
//               disabled={viewMode === "whole"}
//             >
//               {allNodesList.map((n) => (
//                 <option key={n.id} value={n.id}>
//                   {n.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <label className="text-sm">Up</label>
//           <input
//             type="number"
//             min={0}
//             max={5}
//             value={viewMode === "whole" ? 0 : upLevels}
//             onChange={(e) => setUpLevels(Number(e.target.value))}
//             className="w-14 border px-2 py-1 rounded text-sm"
//             disabled={viewMode === "whole"}
//             title={viewMode === "whole" ? "Disabled when viewing whole tree (no ancestor above oldest member)" : "Number of ancestor levels to show"}
//           />
//           <label className="text-sm">Down</label>
//           <input
//             type="number"
//             min={0}
//             max={5}
//             value={downLevels}
//             onChange={(e) => setDownLevels(Number(e.target.value))}
//             className="w-14 border px-2 py-1 rounded text-sm"
//           />
//           <div className="flex items-center gap-1 ml-4">
//             <button
//               onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
//               className="px-2 py-1 border rounded"
//             >
//               −
//             </button>
//             <div className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</div>
//             <button
//               onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
//               className="px-2 py-1 border rounded"
//             >
//               +
//             </button>
//             <button onClick={() => setZoom(1)} className="px-2 py-1 border rounded ml-2">
//               reset
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Scrollable canvas area that handles overflow in both directions. We also apply scaling. */}
//       <div
//         className="border rounded overflow-auto bg-white"
//         style={{ width: "100%", height: "60vh" }}
//       >
//         <div
//           className="flex justify-center py-6"
//           style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
//         >
//           <div className="min-w-[300px]">
//             {prunedTree ? <Node node={prunedTree} /> : <div className="p-4">Nothing to show</div>}
//           </div>
//         </div>
//       </div>

//       <div className="mt-4 text-sm text-gray-600">
//         Two view modes are available:
//         <ul className="list-disc ml-5 mt-1">
//           <li>
//             <strong>By current user</strong> — viewported: shows the selected user and up to the specified
//             ancestor/descendant levels (useful to avoid rendering huge trees).
//           </li>
//           <li>
//             <strong>Whole tree</strong> — shows the full family tree from the oldest member (root). The
//             <em>Up</em> control and Focus selector are disabled in this mode because there are no
//             ancestors above the oldest member.
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// }






// import React, { useState, useEffect, useMemo } from "react";
// import { useAuth } from "../services/useAuth.jsx";

// const apiBase = "http://localhost:5000/api/v1/persons";

// export default function FamilyTree() {
//   const { user } = useAuth();
//   console.log("Current user:", user);
//   const [tree, setTree] = useState(null); // whole tree
//   const [viewMode, setViewMode] = useState("current"); // 'current' or 'whole'
//   const [zoom, setZoom] = useState(1);
//   const [upLevels, setUpLevels] = useState(2);
//   const [downLevels, setDownLevels] = useState(2);

//   // Fetch whole tree once
//   const fetchTree = async () => {
//     try {
//       const res = await fetch(`${apiBase}/tree/whole`, {
//         method: "GET",
//         credentials: "include", // send cookies
//       });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//       const data = await res.json();
//       const arrData = Array.isArray(data) ? data : [data];
//       setTree(arrData);
//       console.log("Fetched tree:", arrData);
//     } catch (err) {
//       console.error("Fetch tree error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchTree();
//   }, []);

//   // Build parent map and nodesById
//   const { parentMap, nodesById } = useMemo(() => {
//     const map = new Map();
//     const byId = new Map();

//     const dfs = (node, parent = {}) => {
//       if (!node) return;
//       byId.set(node._id, node);
//       if (parent) map.set(node, parent);
//       (node.children || []).forEach(c => dfs(c, node));
//     };

//     if (Array.isArray(tree)) tree.forEach(root => dfs(root));
//     console.log("Parent map:", map);
//     return { parentMap: map, nodesById: byId };
//   }, [tree]);

//   // Ancestors & Descendants
//   const getAncestors = (id, maxLevels) => {
//     const res = [];
//     let cur = id;
//     for (let i = 0; i < maxLevels; i++) {
//       const p = parentMap.get(cur);
//       if (!p) break;
//       res.push(p);
//       cur = p;
//     }
//     return res;
//   };

//   const getDescendants = (id, maxDepth) => {
//     const res = new Set();
//     const q = [{ id, depth: 0 }];
//     while (q.length) {
//       const { id: nid, depth } = q.shift();
//       if (depth > 0) res.add(nid);
//       if (depth === maxDepth) continue;
//       const node = nodesById.get(nid);
//       if (!node) continue;
//       (node.children || []).forEach(c => q.push({ id: c._id, depth: depth + 1 }));
//     }
//     return res;
//   };

//   // Find node by user._id
//   const findNodeByUserId = (nodes, userId) => {
//     for (let node of nodes) {
//       if (node.user === userId) return node; // match by user._id
//       if (node.children) {
//         const found = findNodeByUserId(node.children, userId);
//         if (found) return found;
//       }
//     }
//     return null;
//   };

//   // Build tree to render based on viewMode
//   const treeToRender = useMemo(() => {
//     if (!tree) return null;
//     if (viewMode === "whole") return tree;
//     if (!user?._id) return null;

//     const focalNode = findNodeByUserId(tree, user._id);
//     if (!focalNode) return null;
//     // console.log("Focal Node:", focalNode);
//     const allowedSet = new Set();
//     allowedSet.add(focalNode._id);
//     getAncestors(focalNode._id, upLevels).forEach(a => allowedSet.add(a));
//     getDescendants(focalNode._id, downLevels).forEach(d => allowedSet.add(d));

//     const cloneIfAllowed = (node) => {
//       if (!node || !allowedSet.has(node._id)) return null;
//       return {
//         ...node,
//         children: (node.children || []).map(c => cloneIfAllowed(c)).filter(Boolean),
//       };
//     };

//     return [cloneIfAllowed(focalNode)];
//   }, [tree, user, viewMode, upLevels, downLevels]);

//   // Add child
//   const addChild = async (parentId) => {
//     const childName = prompt("Enter child name:");
//     if (!childName) return;
//     const gender = prompt("Enter child gender (male/female):", "male");

//     try {
//       await fetch(`${apiBase}/child/${parentId}`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: childName, gender }),
//       });
//       fetchTree();
//     } catch (err) {
//       console.error("Add child error:", err);
//     }
//   };

//   // Add spouse
//   const addSpouse = async (nodeId) => {
//     const spouseName = prompt("Enter spouse name:");
//     if (!spouseName) return;
//     const target = nodesById.get(nodeId);
//     if (!target) return;
//     const gender = target.gender === "male" ? "female" : "male";

//     try {
//       await fetch(`${apiBase}`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: spouseName, gender, relationType: "spouse", relationTo: nodeId }),
//       });
//       fetchTree();
//     } catch (err) {
//       console.error("Add spouse error:", err);
//     }
//   };

//   // Node component
//   const Node = ({ node }) => (
//     <div className="flex flex-col items-center min-w-[120px]">
//       <div className="flex items-center space-x-2 p-1 rounded border bg-white shadow-sm">
//         <div className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center text-xs">{node.name}</div>
//         {node.spouse && <div className="w-12 h-12 rounded-full border-2 border-pink-600 flex items-center justify-center text-xs">{node.spouse}</div>}
//       </div>
//       <div className="flex space-x-1 mt-1">
//         <button onClick={() => addChild(node._id)} className="text-xs border px-1 rounded">+ Child</button>
//         <button onClick={() => addSpouse(node._id)} className="text-xs border px-1 rounded">+ Spouse</button>
//       </div>
//       {node.children && node.children.length > 0 && (
//         <div className="flex flex-col items-center mt-3">
//           <div className="w-px h-4 bg-gray-400" />
//           <div className="flex space-x-4 mt-3">
//             {node.children.map(c => <Node key={c._id} node={c} />)}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="p-4">
//       <div className="flex flex-wrap items-center gap-4 mb-4">
//         <label>View Mode:</label>
//         <label>
//           <input type="radio" checked={viewMode === "current"} onChange={() => setViewMode("current")} /> Current User
//         </label>
//         <label>
//           <input type="radio" checked={viewMode === "whole"} onChange={() => setViewMode("whole")} /> Whole Tree
//         </label>

//         <label>Up Levels:</label>
//         <input type="number" min={0} max={5} value={viewMode === "whole" ? 0 : upLevels} onChange={(e) => setUpLevels(Number(e.target.value))} disabled={viewMode === "whole"} />

//         <label>Down Levels:</label>
//         <input type="number" min={0} max={5} value={downLevels} onChange={(e) => setDownLevels(Number(e.target.value))} />

//         <label>Zoom:</label>
//         <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}>-</button>
//         <span>{Math.round(zoom * 100)}%</span>
//         <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
//         <button onClick={() => setZoom(1)}>Reset</button>
//       </div>

//       <div className="overflow-auto border rounded bg-white" style={{ width: "100%", height: "60vh" }}>
//         <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }} className="flex justify-center py-6">
//           {treeToRender && treeToRender.length > 0 ? treeToRender.map(n => <Node key={n._id} node={n} />) : <div className="p-4">Nothing to show</div>}
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect, useMemo } from "react";
import { api, useAuth } from "../services/useAuth.jsx"; 
import { FiLoader, FiZoomIn, FiZoomOut, FiRefreshCw, FiArrowUp, FiAlertCircle, FiPlus } from "react-icons/fi";

// ==========================================
// 🔄 DATA TRANSFORMERS
// ==========================================
const transformToTree = (person) => {
  if (!person) return null;
  const isMale = person.gender === "male";
  const mainNode = { name: person.name, avatarUrl: person.avatarUrl, _id: person._id };
  const spouseNode = person.spouse ? { name: person.spouse.name, avatarUrl: person.spouse.avatarUrl, _id: person.spouse._id } : { name: null };
  return {
    id: person._id, 
    male: isMale ? mainNode : spouseNode,
    female: !isMale ? mainNode : spouseNode,
    children: (person.children || []).map(transformToTree)
  };
};

const stitchAncestors = (userTree, ancestorsList) => {
  if (!ancestorsList || ancestorsList.length === 0) return userTree;
  const sortedAncestors = [...ancestorsList].sort((a, b) => a.level - b.level);
  let currentChild = userTree;
  sortedAncestors.forEach(ancestor => {
    const ancestorNode = transformToTree({ ...ancestor, children: [] });
    if (ancestorNode) {
        ancestorNode.children = [currentChild];
        currentChild = ancestorNode;
    }
  });
  return currentChild; 
};

export default function FamilyTree() {
  const { user, loading: authLoading } = useAuth(); 
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("current");
  const [focalId, setFocalId] = useState(null); 
  const [zoom, setZoom] = useState(0.8);
  const [downLevels, setDownLevels] = useState(2);
  const [upLevels, setUpLevels] = useState(1); 

  // ==========================================
  // 📡 API FETCHING
  // ==========================================
  const fetchData = async () => {
    if (!user) return; 
    setLoading(true); setError(null); 
    try {
      let finalTree = null;
      if (viewMode === "current") {
        const resDesc = await api.get("/persons/tree/descendants");
        const rootPerson = resDesc.data.rootPerson;
        if (rootPerson) {
            const userSubTree = transformToTree({
                ...rootPerson,
                spouse: resDesc.data.rootSpouse,
                children: resDesc.data.descendants,
                gender: rootPerson.gender 
            });
            try {
               const resAnc = await api.get("/persons/tree/ancestors");
               const ancestors = resAnc.data.ancestors || [];
               finalTree = stitchAncestors(userSubTree, ancestors);
               setFocalId(userSubTree.id); 
            } catch (e) {
               finalTree = userSubTree;
               setFocalId(userSubTree.id);
            }
        } else {
            setError("No primary person found. Create your profile first.");
        }
      } else {
        const res = await api.get("/persons/tree/whole");
        const roots = res.data.tree || [];
        if (roots.length > 0) {
            finalTree = transformToTree(roots[0]);
            if (user?.primaryPerson) setFocalId(user.primaryPerson);
            else setFocalId(finalTree.id); 
        } else {
            finalTree = null; 
        }
      }
      setTreeData(finalTree);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load family tree.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchData();
  }, [viewMode, user, authLoading]);

  // ==========================================
  // 🧠 PRUNING LOGIC
  // ==========================================
  const { parentMap, nodesById } = useMemo(() => {
    if (!treeData) return { parentMap: new Map(), nodesById: new Map() };
    const pMap = new Map();
    const nMap = new Map();
    function dfs(node, parent = null) {
      nMap.set(node.id, node);
      if (parent) pMap.set(node.id, parent.id);
      (node.children || []).forEach((c) => dfs(c, node));
    }
    dfs(treeData, null);
    return { parentMap: pMap, nodesById: nMap };
  }, [treeData]);

  const visibleTree = useMemo(() => {
    if (!treeData || !focalId || !nodesById.has(focalId)) return treeData;
    if (viewMode === "whole") return treeData;

    const allowed = new Set();
    const q = [{ id: focalId, d: 0 }];
    while(q.length) {
        const {id, d} = q.shift();
        allowed.add(id);
        if(d < downLevels) {
            nodesById.get(id)?.children?.forEach(c => q.push({ id: c.id, d: d + 1 }));
        }
    }
    let curr = focalId;
    let up = 0;
    while(curr && up <= upLevels) {
        allowed.add(curr);
        curr = parentMap.get(curr);
        up++;
    }
    function clone(node) {
        if (!allowed.has(node.id)) return null;
        const copy = { ...node, children: [] };
        node.children.forEach(c => {
            const childCopy = clone(c);
            if (childCopy) copy.children.push(childCopy);
        });
        return copy;
    }
    let visualRootId = focalId;
    let steps = 0;
    while(steps < upLevels) {
        const p = parentMap.get(visualRootId);
        if(!p || !allowed.has(p)) break;
        visualRootId = p;
        steps++;
    }
    return clone(nodesById.get(visualRootId));
  }, [treeData, focalId, downLevels, upLevels, viewMode]);

  // ==========================================
  // 🎨 RENDERERS
  // ==========================================
  
  const renderPersonCircle = (person, isMale) => {
    const present = !!person?.name;
    const isMe = user?.primaryPerson === person._id;
    const isFocal = person._id === focalId; 

    return (
      <div className="mt-10 flex flex-col items-center relative group">
        <div
          // 🔵🔴🟡 COLOR LOGIC
          className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center overflow-hidden bg-white shadow-sm transition-all duration-300 ease-in-out
            ${isMe 
                ? "border-yellow-400 text-yellow-700 ring-4 ring-yellow-400/30 scale-110 shadow-lg shadow-yellow-100 z-10" 
                : isMale 
                    ? "border-blue-500 text-blue-600 ring-2 ring-blue-100" 
                    : "border-pink-500 text-pink-600 ring-2 ring-pink-100"
            }
            ${!isMe ? "hover:scale-105 hover:shadow-md hover:border-gray-300" : ""}
            ${!isMe && isFocal ? "ring-2 ring-indigo-200" : ""}
          `}
        >
          {person.avatarUrl ? (
            <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
          ) : (
             present ? (
               <span className="text-sm font-bold tracking-tighter">
                  {person.name.charAt(0).toUpperCase()}
               </span>
             ) : (
               <FiPlus className="text-gray-300 text-xl" />
             )
          )}
        </div>
        
        {isMe && (
            <span className="absolute -top-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 tracking-wide">
                YOU
            </span>
        )}

        <div className="mt-2 text-center">
            {present ? (
               <>
                 <div className={`text-xs font-bold leading-tight ${isMe ? "text-yellow-700" : "text-gray-800"}`}>
                    {person.name}
                 </div>
                 <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                    {isMale ? "Male" : "Female"}
                 </div>
               </>
            ) : (
               <div className="text-[10px] text-gray-400 font-medium">Empty</div>
            )}
        </div>
      </div>
    );
  };

  const Node = ({ node }) => {
    if (!node) return null;
    return (
      <div className="flex flex-col items-center relative min-w-[200px] mx-2"> {/* mx-2 gives breathing room */}
        
        {/* CARD */}
        <div className="flex items-center space-x-6 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 z-10 relative">
          {renderPersonCircle(node.male, true)}
          <div className="h-10 w-px bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100"></div>
          {renderPersonCircle(node.female, false)}
        </div>

        {/* CHILDREN RENDERER */}
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center">
            
            {/* 1. Vertical Line Down from Parent Card */}
            <div className="w-px h-10 bg-gray-300"></div>

            {/* 2. Container for Children */}
            <div className="flex items-start"> 
                {node.children.map((child, index) => (
                    // 🔴 FIX: Use px-6 on wrapper instead of space-x on parent to handle line width correctly
                    <div key={child.id} className="flex flex-col items-center relative px-6"> 
                        
                        {/* 🔴 FIX: The Horizontal Lines are now individual per child */}
                        {node.children.length > 1 && (
                            <>
                                {/* Left Line: Hidden for First Child */}
                                <div className={`absolute top-0 right-1/2 w-1/2 h-px bg-gray-300 ${index === 0 ? "hidden" : "block"}`}></div>
                                
                                {/* Right Line: Hidden for Last Child */}
                                <div className={`absolute top-0 left-1/2 w-1/2 h-px bg-gray-300 ${index === node.children.length - 1 ? "hidden" : "block"}`}></div>
                            </>
                        )}

                        {/* 3. Vertical Line Up from Child Card */}
                        <div className="w-px h-10 bg-gray-300"></div>
                        
                        <Node node={child} />
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center text-gray-400 font-medium"><FiLoader className="animate-spin text-2xl mr-3 text-indigo-500"/> Authenticating...</div>;
  if (loading && !treeData) return <div className="h-screen flex items-center justify-center text-gray-400 font-medium"><FiLoader className="animate-spin text-2xl mr-3 text-indigo-500"/> Building Tree...</div>;

  // ==========================================
  // 🟢 FIXED LAYOUT
  // ==========================================
  return (
    <div className="h-[calc(100vh-110px)] flex flex-col font-sans overflow-hidden bg-gray-50">
      
      {/* TOOLBAR */}
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

      {/* CANVAS */}
      <div className="flex-1 overflow-hidden relative bg-[#F8FAFC]">
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing p-20">
            <div className="min-w-max min-h-max flex justify-center origin-top pt-10" style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}>
                
                {error ? (
                    <div className="mt-20 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-sm mx-auto z-10">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <FiAlertCircle className="text-3xl text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Oops!</h3>
                        <p className="text-gray-500 text-center text-sm mt-2 mb-6">{error}</p>
                        <button onClick={fetchData} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-200">Try Again</button>
                    </div>
                ) : visibleTree ? (
                    <Node node={visibleTree} /> 
                ) : (
                    <div className="flex flex-col items-center justify-center mt-20 z-10 opacity-60">
                         <div className="text-6xl mb-4">🌳</div>
                         <div className="text-gray-400 font-medium">Your family tree is waiting to grow.</div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}