"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  Calculator,
  Users,
  Briefcase,
  Settings,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  role?: string;
};

export default function Sidebar({
  collapsed,
  setCollapsed,
  role,
}: SidebarProps) {
  const pathname = usePathname();

const navItems = [
  {
    name: "Calculator",
    icon: Calculator,
    path: "/",
    roles: ["admin", "installer"],
  },
  {
    name: "Users",
    icon: Users,
    path: "/admin/users",
    roles: ["admin"], // only admin
  },
  {
    name: "Jobs",
    icon: Briefcase,
    path: "/jobs",
    roles: ["admin", "installer"],
  },
];

  return (
    <aside
      className={`fixed left-6 top-6 bottom-6 z-40 ${
        collapsed ? "w-20" : "w-64"
      } bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col transition-all duration-300`}
    >
      {/* LOGO */}
      <div className="p-5 flex items-center justify-between border-b border-gray-200">
        {!collapsed && (
          <img
            src="/gp-logo-1.svg"
            className="w-36 transition-all duration-300"
          />
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 space-y-2 pt-4">
        {navItems
  .filter((item) => item.roles.includes(role || ""))
  .map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <motion.a
              key={item.name}
              href={item.path}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />

              {!collapsed && (
                <span className="font-medium">
                  {item.name}
                </span>
              )}
            </motion.a>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-200">
        <a
          href="/settings"
          className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition"
        >
          <Settings size={18} />
          {!collapsed && "Settings"}
        </a>
      </div>
    </aside>
  );
}