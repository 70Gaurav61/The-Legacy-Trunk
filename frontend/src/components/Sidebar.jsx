// src/components/Sidebar.js

import React from 'react';
import ActionCard from './ActionCard';
import { Plus, TreePine } from 'lucide-react'; // Example icons

function Sidebar() {
  return (
    <aside className="space-y-6">
      <ActionCard 
        title="Create Your own Story" 
        icon={<Plus size={28} />}
        bgColor="bg-indigo-600"
      />
      <ActionCard 
        title="Show family tree" 
        icon={<TreePine size={28} />}
        bgColor="bg-green-600"
      />
    </aside>
  );
}

export default Sidebar;