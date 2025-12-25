import React from "react";
import FamilyTree from "../components/FamilyTree"; // 🟢 Import your main tree component
import PersonListSidebar from "../components/PersonListSidebar"; // 🟢 The sidebar we created earlier

export default function TreePage() {
  return (
    // 🟢 LAYOUT: Fixed height (viewport - navbar), Flex container
    // We assume Navbar is ~64px. Adjust if needed.
    <div className="flex h-full w-full gap-3 p-0 bg-gray-50 overflow-hidden">
      
      {/* 🟢 LEFT: THE TREE (Takes remaining space) */}
      <div className="flex-1 h-[calc(100vh-110px)] w-80 relative border-r border-gray-200">
        <FamilyTree />
      </div>

      {/* 🟢 RIGHT: SIDEBAR (Fixed Width) */}
      <div className="w-80 h-full flex-shrink-0 bg-white shadow-xl z-20">
        <PersonListSidebar />
      </div>

    </div>
  );
}