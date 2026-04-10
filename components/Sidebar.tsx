"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu, Calculator, Users, Briefcase, Settings,
  ChevronDown, ChevronUp, LogOut,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  role?: string;
};

export default function Sidebar({ collapsed, setCollapsed, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = (role || "").toLowerCase().trim() === "admin";
  const [jobsOpen, setJobsOpen] = useState(
    !!(pathname?.startsWith("/jobs") || pathname?.startsWith("/admin/jobs"))
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (path: string) =>
    pathname === path || (path !== "/dashboard" && (pathname ?? "").startsWith(path));

  return (
    <aside
      className={`fixed left-6 top-6 bottom-6 z-40 ${
        collapsed ? "w-20" : "w-64"
      } bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col transition-all duration-300`}
    >
      {/* Logo — restore original GP HVAC logo */}
      <div className="p-5 flex items-center justify-between border-b border-gray-200">
        {!collapsed && (
          <img
            src="/gp-logo-1.svg"
            alt="GP HVAC"
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

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 pt-4 overflow-y-auto">

        {/* Calculator */}
        <motion.a
          href="/dashboard"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive("/dashboard")
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Calculator size={18} />
          {!collapsed && <span className="font-medium">Calculator</span>}
        </motion.a>

        {/* Users (admin only) */}
        {isAdmin && (
          <motion.a
            href="/admin/users"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              isActive("/admin/users")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Users size={18} />
            {!collapsed && <span className="font-medium">Users</span>}
          </motion.a>
        )}

        {/* Jobs with expandable sub-menu */}
        <div>
          <button
            onClick={() => !collapsed && setJobsOpen((o) => !o)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              isActive("/jobs") || isActive("/admin/jobs")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Briefcase size={18} />
            {!collapsed && (
              <>
                <span className="font-medium flex-1 text-left">Jobs</span>
                {jobsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </>
            )}
          </button>

          {/* Sub-items */}
          {!collapsed && jobsOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
              <a
                href="/jobs"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  pathname === "/jobs"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Briefcase size={14} />
                Installer Jobs
              </a>
              {isAdmin && (
                <a
                  href="/admin/jobs"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                    (pathname ?? "").startsWith("/admin/jobs")
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Briefcase size={14} />
                  Admin Jobs
                </a>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <a
          href="/settings"
          className="flex items-center gap-3 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <Settings size={18} />
          {!collapsed && <span className="font-medium">Settings</span>}
        </a>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
