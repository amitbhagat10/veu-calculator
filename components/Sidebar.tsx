"use client";

import { Menu, Calculator, Users, Briefcase } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col ${
        collapsed ? "w-20" : "w-64"
      } bg-[#0C1E3B] text-white p-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-10">
        {!collapsed && (
          <img src="/logo.png" className="w-20" />
        )}
        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu size={18} />
        </button>
      </div>

      <nav className="space-y-3 text-sm">
        <div className="bg-white/10 p-3 rounded-lg flex items-center gap-2">
          <Calculator size={16} />
          {!collapsed && "Calculator"}
        </div>

        <div className="hover:bg-white/10 p-3 rounded-lg flex items-center gap-2 cursor-pointer">
          <Users size={16} />
          {!collapsed && "Users"}
        </div>

        <div className="hover:bg-white/10 p-3 rounded-lg flex items-center gap-2 cursor-pointer">
          <Briefcase size={16} />
          {!collapsed && "Jobs"}
        </div>
      </nav>
    </aside>
  );
}