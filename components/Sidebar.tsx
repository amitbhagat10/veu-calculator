"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Calculator, Users, Briefcase, LogOut,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  role?: string;
}

export default function Sidebar({ collapsed, setCollapsed, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [jobsOpen, setJobsOpen] = useState(
    pathname?.startsWith("/admin/jobs") || pathname?.startsWith("/jobs")
  );

  const isAdmin = role === "admin";

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;
  const isPrefix = (path: string) => pathname?.startsWith(path);

  const NavItem = ({
    icon: Icon, label, path, onClick, indent = false,
  }: {
    icon: any; label: string; path?: string; onClick?: () => void; indent?: boolean;
  }) => {
    const active = path ? isActive(path) : false;
    return (
      <button
        onClick={onClick || (() => path && router.push(path))}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
          indent ? "pl-10" : ""
        } ${
          active
            ? "bg-white/15 text-white"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#1a2e5a] flex flex-col transition-all duration-300 z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="bg-[#c8ff00] rounded-lg px-2 py-1">
              <span className="text-[#1a2e5a] font-black text-sm tracking-tight">Rebate</span>
              <span className="text-[#1a2e5a] text-lg font-black">⚡</span>
              <span className="text-[#1a2e5a] font-black text-sm tracking-tight">Hub</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#c8ff00] rounded-lg w-8 h-8 flex items-center justify-center">
            <span className="text-[#1a2e5a] font-black text-base">⚡</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavItem icon={Calculator} label="Calculator" path="/dashboard" />

        {isAdmin && (
          <NavItem icon={Users} label="Users" path="/admin/users" />
        )}

        {/* Jobs with sub-menu */}
        <div>
          <button
            onClick={() => setJobsOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isPrefix("/admin/jobs") || isPrefix("/jobs")
                ? "bg-white/15 text-white"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Briefcase size={18} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Jobs</span>
                {jobsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </>
            )}
          </button>

          {!collapsed && jobsOpen && (
            <div className="mt-1 space-y-0.5">
              {!isAdmin && (
                <button
                  onClick={() => router.push("/jobs")}
                  className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all ${
                    isActive("/jobs")
                      ? "bg-white/15 text-white font-medium"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Briefcase size={15} className="shrink-0" />
                  Installer Jobs
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => router.push("/jobs")}
                    className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all ${
                      isActive("/jobs")
                        ? "bg-white/15 text-white font-medium"
                        : "text-blue-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Briefcase size={15} />
                    Installer Jobs
                  </button>
                  <button
                    onClick={() => router.push("/admin/jobs")}
                    className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all ${
                      isPrefix("/admin/jobs")
                        ? "bg-white/15 text-white font-medium"
                        : "text-blue-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Briefcase size={15} />
                    Admin Jobs
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-[#1a2e5a] border border-white/20 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-[#243a70] transition shadow-md"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
