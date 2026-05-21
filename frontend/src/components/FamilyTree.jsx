
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { api, useAuth } from "../services/useAuth.jsx"; 
import AddMemberModal from "../components/AddMemberModal"; 
import Toast from "../components/ui/Toast";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import TreeNode from "./TreeNode";
import TreeControls from "./TreeControls";

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
  const startPan = useRef({ x: 0, y: 0 });
  const [toast, setToast] = useState(null);

  const [viewMode, setViewMode] = useState("current");
  const [focalId, setFocalId] = useState(null); 
  const [zoom, setZoom] = useState(0.8);
  const [downLevels, setDownLevels] = useState(2);
  const [upLevels, setUpLevels] = useState(1); 

  // Handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    startPan.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startPan.current.x;
    const dy = e.clientY - startPan.current.y;
    containerRef.current.scrollLeft -= dx;
    containerRef.current.scrollTop -= dy;
    startPan.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  }, []);

  // 🟢 ACTION HANDLERS
  const handleOpenAddChild = useCallback((personId, personName) => {
    setModalConfig({ type: "child", personId, personName });
    setIsModalOpen(true);
  }, []);

  const handleOpenAddParent = useCallback((personId, personName) => {
    setModalConfig({ type: "parent", personId, personName });
    setIsModalOpen(true);
  }, []);

  // 🟢 NEW: ADD SPOUSE HANDLER
  const handleOpenAddSpouse = useCallback((personId, personName) => {
    setModalConfig({ type: "spouse", personId, personName });
    setIsModalOpen(true);
  }, []);

  const fetchData = useCallback(async () => {
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
  }, [user, viewMode]);

  const handleSavePerson = async (payload) => {
    try {
        await api.post("/persons", payload);
        setToast({ message: "Successfully added person", type: "success" });
        fetchData(); 
    } catch (err) {
        setToast({ message: err.response?.data?.message || "Failed to add person", type: "error" });
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchData();
  }, [viewMode, user, authLoading, fetchData]);

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

  if (authLoading) return <div className="h-screen flex items-center justify-center text-gray-400 font-medium"><FiLoader className="animate-spin text-2xl mr-3 text-indigo-500"/> Authenticating...</div>;
  if (loading && !treeData) return <div className="h-screen flex items-center justify-center text-gray-400 font-medium"><FiLoader className="animate-spin text-2xl mr-3 text-indigo-500"/> Building Tree...</div>;

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col font-sans overflow-hidden bg-gray-50">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        config={modalConfig}
        onSave={handleSavePerson}
      />

      <TreeControls 
        viewMode={viewMode} setViewMode={setViewMode}
        upLevels={upLevels} setUpLevels={setUpLevels}
        downLevels={downLevels} setDownLevels={setDownLevels}
        zoom={zoom} setZoom={setZoom}
        fetchData={fetchData}
      />

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
                    <TreeNode node={visibleTree} user={user} focalId={focalId} onAddParent={handleOpenAddParent} onAddChild={handleOpenAddChild} onAddSpouse={handleOpenAddSpouse} /> 
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