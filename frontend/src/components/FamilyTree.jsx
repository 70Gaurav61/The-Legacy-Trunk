

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
  // const { parentMap, nodesById, allNodesList } = useMemo(() => {
  //   const parentMap = new Map();
  //   const nodesById = new Map();
  //   const all = [];
  //   function dfs(node, parent = null) {
  //     nodesById.set(node.id, node);
  //     all.push(node);
  //     if (parent) parentMap.set(node.id, parent.id);
  //     (node.children || []).forEach((c) => dfs(c, node));
  //   }
  //   dfs(tree, null);
  //   return {
  //     parentMap,
  //     nodesById,
  //     allNodesList: all.map((n) => ({ id: n.id, label: nodeLabel(n) })),
  //   };
  // }, [tree]);

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






import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../services/useAuth.jsx";

const apiBase = "http://localhost:5000/api/v1/persons";

export default function FamilyTree() {
  const { user } = useAuth();
  console.log("Current user:", user);
  const [tree, setTree] = useState(null); // whole tree
  const [viewMode, setViewMode] = useState("current"); // 'current' or 'whole'
  const [zoom, setZoom] = useState(1);
  const [upLevels, setUpLevels] = useState(2);
  const [downLevels, setDownLevels] = useState(2);

  // Fetch whole tree once
  const fetchTree = async () => {
    try {
      const res = await fetch(`${apiBase}/tree/whole`, {
        method: "GET",
        credentials: "include", // send cookies
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const arrData = Array.isArray(data) ? data : [data];
      setTree(arrData);
      console.log("Fetched tree:", arrData);
    } catch (err) {
      console.error("Fetch tree error:", err);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  // Build parent map and nodesById
  const { parentMap, nodesById } = useMemo(() => {
    const map = new Map();
    const byId = new Map();

    const dfs = (node, parent = {}) => {
      if (!node) return;
      byId.set(node._id, node);
      if (parent) map.set(node, parent);
      (node.children || []).forEach(c => dfs(c, node));
    };

    if (Array.isArray(tree)) tree.forEach(root => dfs(root));
    console.log("Parent map:", map);
    return { parentMap: map, nodesById: byId };
  }, [tree]);

  // Ancestors & Descendants
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

  const getDescendants = (id, maxDepth) => {
    const res = new Set();
    const q = [{ id, depth: 0 }];
    while (q.length) {
      const { id: nid, depth } = q.shift();
      if (depth > 0) res.add(nid);
      if (depth === maxDepth) continue;
      const node = nodesById.get(nid);
      if (!node) continue;
      (node.children || []).forEach(c => q.push({ id: c._id, depth: depth + 1 }));
    }
    return res;
  };

  // Find node by user._id
  const findNodeByUserId = (nodes, userId) => {
    for (let node of nodes) {
      if (node.user === userId) return node; // match by user._id
      if (node.children) {
        const found = findNodeByUserId(node.children, userId);
        if (found) return found;
      }
    }
    return null;
  };

  // Build tree to render based on viewMode
  const treeToRender = useMemo(() => {
    if (!tree) return null;
    if (viewMode === "whole") return tree;
    if (!user?._id) return null;

    const focalNode = findNodeByUserId(tree, user._id);
    if (!focalNode) return null;
    // console.log("Focal Node:", focalNode);
    const allowedSet = new Set();
    allowedSet.add(focalNode._id);
    getAncestors(focalNode._id, upLevels).forEach(a => allowedSet.add(a));
    getDescendants(focalNode._id, downLevels).forEach(d => allowedSet.add(d));

    const cloneIfAllowed = (node) => {
      if (!node || !allowedSet.has(node._id)) return null;
      return {
        ...node,
        children: (node.children || []).map(c => cloneIfAllowed(c)).filter(Boolean),
      };
    };

    return [cloneIfAllowed(focalNode)];
  }, [tree, user, viewMode, upLevels, downLevels]);

  // Add child
  const addChild = async (parentId) => {
    const childName = prompt("Enter child name:");
    if (!childName) return;
    const gender = prompt("Enter child gender (male/female):", "male");

    try {
      await fetch(`${apiBase}/child/${parentId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: childName, gender }),
      });
      fetchTree();
    } catch (err) {
      console.error("Add child error:", err);
    }
  };

  // Add spouse
  const addSpouse = async (nodeId) => {
    const spouseName = prompt("Enter spouse name:");
    if (!spouseName) return;
    const target = nodesById.get(nodeId);
    if (!target) return;
    const gender = target.gender === "male" ? "female" : "male";

    try {
      await fetch(`${apiBase}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: spouseName, gender, relationType: "spouse", relationTo: nodeId }),
      });
      fetchTree();
    } catch (err) {
      console.error("Add spouse error:", err);
    }
  };

  // Node component
  const Node = ({ node }) => (
    <div className="flex flex-col items-center min-w-[120px]">
      <div className="flex items-center space-x-2 p-1 rounded border bg-white shadow-sm">
        <div className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center text-xs">{node.name}</div>
        {node.spouse && <div className="w-12 h-12 rounded-full border-2 border-pink-600 flex items-center justify-center text-xs">{node.spouse}</div>}
      </div>
      <div className="flex space-x-1 mt-1">
        <button onClick={() => addChild(node._id)} className="text-xs border px-1 rounded">+ Child</button>
        <button onClick={() => addSpouse(node._id)} className="text-xs border px-1 rounded">+ Spouse</button>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center mt-3">
          <div className="w-px h-4 bg-gray-400" />
          <div className="flex space-x-4 mt-3">
            {node.children.map(c => <Node key={c._id} node={c} />)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label>View Mode:</label>
        <label>
          <input type="radio" checked={viewMode === "current"} onChange={() => setViewMode("current")} /> Current User
        </label>
        <label>
          <input type="radio" checked={viewMode === "whole"} onChange={() => setViewMode("whole")} /> Whole Tree
        </label>

        <label>Up Levels:</label>
        <input type="number" min={0} max={5} value={viewMode === "whole" ? 0 : upLevels} onChange={(e) => setUpLevels(Number(e.target.value))} disabled={viewMode === "whole"} />

        <label>Down Levels:</label>
        <input type="number" min={0} max={5} value={downLevels} onChange={(e) => setDownLevels(Number(e.target.value))} />

        <label>Zoom:</label>
        <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}>-</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
        <button onClick={() => setZoom(1)}>Reset</button>
      </div>

      <div className="overflow-auto border rounded bg-white" style={{ width: "100%", height: "60vh" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }} className="flex justify-center py-6">
          {treeToRender && treeToRender.length > 0 ? treeToRender.map(n => <Node key={n._id} node={n} />) : <div className="p-4">Nothing to show</div>}
        </div>
      </div>
    </div>
  );
}
