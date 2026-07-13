import React from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiChevronUp, FiChevronDown } from "react-icons/fi";

const renderPersonCircle = ({ person, isMale, partnerId, partnerName, user, focalId, onAddParent, onAddSpouse, navigate }) => {
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
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onAddParent(person._id, person.name); }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-100 hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 p-1 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 z-30"
              title="Add Parent"
              aria-label="Add Parent"
          >
              <FiChevronUp size={14} />
          </button>
      )}

      <div
        className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center overflow-hidden bg-white shadow-sm transition-all duration-300 ease-in-out
          ${borderColor}
          ${ringEffect}
          ${textColor}
          ${present ? 'cursor-pointer' : ''}
        `}
        onClick={(e) => {
          if (!present) return;
          e.stopPropagation();
            navigate(`/person/${person._id}`);
        }}
      >
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
        ) : (
           present ? (
             <span className="text-sm font-bold tracking-tighter">
                {person.name.charAt(0).toUpperCase()}
             </span>
           ) : (
             <button 
               type="button"
               onMouseDown={(e) => e.stopPropagation()}
               className="w-full h-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative z-50"
               onClick={(e) => {
                  if (partnerId) {
                      e.stopPropagation();
                      onAddSpouse(partnerId, partnerName);
                  }
               }}
               aria-label="Add Spouse"
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

export default function TreeNode({ node, user, focalId, onAddParent, onAddChild, onAddSpouse }) {
  if (!node) return null;
  
  const attachChildId = node.male._id || node.female._id;
  const attachChildName = node.male.name || node.female.name;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center relative min-w-[200px] mx-6">
      
      <div className="relative group">
          <div className="flex items-center space-x-6 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 z-10 relative">
              
              {renderPersonCircle({ person: node.male, isMale: true, partnerId: node.female?._id, partnerName: node.female?.name, user, focalId, onAddParent, onAddSpouse, navigate })}
              
              <div className="h-10 w-px bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100"></div>
              
              {renderPersonCircle({ person: node.female, isMale: false, partnerId: node.male?._id, partnerName: node.male?.name, user, focalId, onAddParent, onAddSpouse, navigate })}
          
          </div>

          {attachChildId && (
              <button 
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onAddChild(attachChildId, attachChildName)}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-100 hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 p-1 rounded-full shadow border border-gray-200 transition-all opacity-0 group-hover:opacity-100 z-40"
                  title="Add Child"
                  aria-label="Add Child"
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
                      <TreeNode node={child} user={user} focalId={focalId} onAddParent={onAddParent} onAddChild={onAddChild} onAddSpouse={onAddSpouse} />
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}