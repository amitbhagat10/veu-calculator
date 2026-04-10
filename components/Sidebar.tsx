"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calculator, Users, Briefcase, LogOut,
  ChevronDown, ChevronUp, Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  role?: string;
};

export default function Sidebar({ collapsed, setCollapsed, role }: Props) {
  const pathname  = usePathname() ?? "";
  const router    = useRouter();
  const isAdmin   = (role ?? "").toLowerCase().trim() === "admin";

  // Keep jobs menu open if already on a jobs route
  const [jobsOpen, setJobsOpen] = useState(
    pathname.startsWith("/jobs") || pathname.startsWith("/admin/jobs")
  );

  const isActive = (path: string) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path));

  const linkCls = (active: boolean) =>
    `flex items-center gap-3 p-3 rounded-lg transition ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <aside
      className={`fixed left-6 top-6 bottom-6 z-40 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* ── Logo ── */}
      <div className="p-5 flex items-center justify-between border-b border-gray-200 shrink-0">
        {!collapsed && (
          <img src="/gp-logo-1.svg" alt="GP HVAC" className="w-36" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-800 transition p-1"
        >
          {/* Hamburger / X */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" className="w-5 h-5">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">

        {/* Calculator */}
        <Link href="/dashboard" className={linkCls(isActive("/dashboard"))}>
          <Calculator size={18} className="shrink-0" />
          {!collapsed && <span className="font-medium">Calculator</span>}
        </Link>

        {/* Users — admin only */}
        {isAdmin && (
          <Link href="/admin/users" className={linkCls(isActive("/admin/users"))}>
            <Users size={18} className="shrink-0" />
            {!collapsed && <span className="font-medium">Users</span>}
          </Link>
        )}

        {/* ── Jobs (collapsible) ── */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                router.push("/jobs");
              } else {
                setJobsOpen((o) => !o);
              }
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              isActive("/jobs") || isActive("/admin/jobs")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Briefcase size={18} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="font-medium flex-1 text-left">Jobs</span>
                {jobsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </>
            )}
          </button>

          {/* Sub-items — visible only when not collapsed and Jobs is open */}
          {!collapsed && jobsOpen && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-100 space-y-0.5">
              {/* Installer Jobs — everyone sees this */}
              <Link
                href="/jobs"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  pathname === "/jobs"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Briefcase size={14} className="shrink-0" />
                Installer Jobs
              </Link>

              {/* Admin Jobs — admins only */}
              {isAdmin && (
                <Link
                  href="/admin/jobs"
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    pathname.startsWith("/admin/jobs")
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Briefcase size={14} className="shrink-0" />
                  Admin Jobs
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-200 space-y-1 shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
