
import React, { useState, useEffect, useMemo, useRef } from "react";
import { api, useAuth } from "../services/useAuth.jsx"; 
import AddMemberModal from "../components/AddMemberModal"; 
import { FiLoader, FiZoomIn, FiZoomOut, FiRefreshCw, FiArrowUp, FiAlertCircle, FiPlus, FiChevronUp, FiChevronDown } from "react-icons/fi";

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: "", personId: "", personName: "" });

  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const [viewMode, setViewMode] = useState("current");
  const [focalId, setFocalId] = useState(null); 
  const [zoom, setZoom] = useState(0.8);
  const [downLevels, setDownLevels] = useState(2);
  const [upLevels, setUpLevels] = useState(1); 

  // Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartPan({ x: e.clientX, y: e.clientY });
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    containerRef.current.scrollLeft -= dx;
    containerRef.current.scrollTop -= dy;
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  };

  // 🟢 ACTION HANDLERS
  const handleOpenAddChild = (personId, personName) => {
    setModalConfig({ type: "child", personId, personName });
    setIsModalOpen(true);
  };

  const handleOpenAddParent = (personId, personName) => {
    setModalConfig({ type: "parent", personId, personName });
    setIsModalOpen(true);
  };

  // 🟢 NEW: ADD SPOUSE HANDLER
  const handleOpenAddSpouse = (personId, personName) => {
    setModalConfig({ type: "spouse", personId, personName });
    setIsModalOpen(true);
  };

  const handleSavePerson = async (payload) => {
    try {
        await api.post("/persons", payload);
        fetchData(); 
    } catch (err) {
        alert(err.response?.data?.message || "Failed to add person");
    }
  };

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
  // 🎨 RENDERERS (With Add Buttons & Spouse Fix)
  // ==========================================
  
  // 🟢 UPDATE 1: Accept partnerId and partnerName
  const renderPersonCircle = (person, isMale, partnerId, partnerName) => {
    const present = !!person?.name;
    const isMe = user?.primaryPerson === person._id;
    const isFocal = person._id === focalId; 

    let borderColor = "";
    let ringEffect = "";
    let textColor = "";

    if (isMe) {
        borderColor = "border-yellow-400"; 
        textColor = "text-yellow-700"; 
        ringEffect = "ring-4 ring-yellow-400/30 scale-110 shadow-lg shadow-yellow-100 z-10";
    } else {
        if (isMale) {
            borderColor = "border-blue-500";
            textColor = "text-blue-700";
        } else {
            borderColor = "border-pink-500";
            textColor = "text-pink-700";
        }
        if (isFocal) {
            ringEffect = "ring-2 ring-indigo-200";
        } else {
            ringEffect = "hover:scale-105 hover:shadow-md";
        }
    }

    return (
      <div className="mt-10 flex flex-col items-center relative group">
        
        {present && (
            <button 
                // 🟢 FIX: Added onMouseDown stopPropagation to prevent drag start
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); handleOpenAddParent(person._id, person.name); }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-100 hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 p-1 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 z-30"
                title="Add Parent"
            >
                <FiChevronUp size={14} />
            </button>
        )}

        <div
          className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center overflow-hidden bg-white shadow-sm transition-all duration-300 ease-in-out
            ${borderColor}
            ${ringEffect}
            ${textColor}
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
               // 🟢 UPDATE 2: THE PLUS BUTTON FOR EMPTY SPOUSE
               <button 
                 type="button"
                 // 🟢 CRITICAL FIX: Stop drag from interfering with click
                 onMouseDown={(e) => e.stopPropagation()}
                 className="w-full h-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative z-50"
                 onClick={(e) => {
                    if (partnerId) {
                        e.stopPropagation();
                        handleOpenAddSpouse(partnerId, partnerName);
                    }
                 }}
               >
                 <FiPlus className="text-gray-300 text-xl" />
               </button>
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
    
    const attachChildId = node.male._id || node.female._id;
    const attachChildName = node.male.name || node.female.name;

    return (
      <div className="flex flex-col items-center relative min-w-[200px] mx-6">
        
        <div className="relative group">
            <div className="flex items-center space-x-6 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 z-10 relative">
                
                {/* 🟢 UPDATE 3: Pass Partner ID (If Male is empty, pass Female ID, and vice versa) */}
                {renderPersonCircle(node.male, true, node.female?._id, node.female?.name)}
                
                <div className="h-10 w-px bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100"></div>
                
                {renderPersonCircle(node.female, false, node.male?._id, node.male?.name)}
            
            </div>

            {attachChildId && (
                <button 
                    // 🟢 FIX: Stop drag here too
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => handleOpenAddChild(attachChildId, attachChildName)}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-100 hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 p-1 rounded-full shadow border border-gray-200 transition-all opacity-0 group-hover:opacity-100 z-40"
                    title="Add Child"
                >
                    <FiChevronDown size={14} />
                </button>
            )}
        </div>

        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="relative w-full flex justify-center">
                {node.children.length > 1 && (
                    <div className="absolute top-0 h-px bg-gray-300" 
                         style={{ 
                           left: `calc(100% / ${node.children.length * 2})`, 
                           right: `calc(100% / ${node.children.length * 2})` 
                         }}>
                    </div>
                )}
            </div>
            <div className="flex items-start pt-0 space-x-8">
                  {node.children.map((child) => (
                    <div key={child.id} className="flex flex-col items-center relative px-6"> 
                        {node.children.length > 1 && (
                            <>
                                <div className={`absolute top-0 right-1/2 w-1/2 h-px bg-gray-300 ${child === node.children[0] ? "hidden" : "block"}`}></div>
                                <div className={`absolute top-0 left-1/2 w-1/2 h-px bg-gray-300 ${child === node.children[node.children.length - 1] ? "hidden" : "block"}`}></div>
                            </>
                        )}
                        <div className="w-full flex justify-center items-start">
                             <div className="w-px h-10 bg-gray-300"></div>
                        </div>
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

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col font-sans overflow-hidden bg-gray-50">
      
      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        config={modalConfig}
        onSave={handleSavePerson}
      />

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

      <div className="flex-1 overflow-hidden relative bg-[#F8FAFC]">
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full overflow-auto cursor-grab p-20 select-none"
        >
            <div className="min-w-max min-h-max flex justify-center origin-top pt-10" style={{ transform: `scale(${zoom})`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}>
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