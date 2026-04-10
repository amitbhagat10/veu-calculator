"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardWidgets from "@/components/DashboardWidgets";
import CalculatorForm from "@/components/CalculatorForm";
import JobCards from "@/components/JobCards";

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      supabase.from("users").select("role").eq("id", data.user.id).single()
        .then(({ data: u }) =>
          setRole(u?.role?.toLowerCase().trim() ?? "installer")
        );
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#eef2f7]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={role} />

      {/*
        The sidebar uses left-6 (24px), top-6 (24px) positioning (floating card).
        Width: collapsed = 72px, expanded = 256px.
        Main content margin = sidebar_left_offset (24) + sidebar_width + gap (24)
        collapsed : 24 + 72  + 24 = 120  → ml-[120px]  ≈ ml-32 (128) — close enough
        expanded  : 24 + 256 + 24 = 304  → ml-[304px]
      */}
      <main
        className="flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? 120 : 304 }}
      >
        <Header />
        <div className="p-8">
          <DashboardWidgets key={`w-${refreshKey}`} role={role} />
          <CalculatorForm onJobSaved={() => setRefreshKey(k => k + 1)} />
          <JobCards key={`j-${refreshKey}`} role={role} />
        </div>
      </main>
    </div>
  );
}
