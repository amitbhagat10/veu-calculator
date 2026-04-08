"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CalculatorForm from "@/components/CalculatorForm";
import DashboardWidgets from "@/components/DashboardWidgets";
import JobCards from "@/components/JobCards";

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");
  const [widgetKey, setWidgetKey] = useState(0); // used to refresh widgets after save

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setRole(userData?.role?.toLowerCase().trim() || "installer");
  };

  // Called after a job is saved — refreshes widgets + job cards
  const handleJobSaved = () => {
    setWidgetKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen bg-[#eef2f7]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={role} />

      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-32" : "ml-80"
        }`}
      >
        <Header />

        <div className="p-10">
          {/* Dynamic Stats Widgets */}
          <DashboardWidgets key={widgetKey} role={role} />

          {/* Calculator */}
          <CalculatorForm onJobSaved={handleJobSaved} />

          {/* Job Cards */}
          <JobCards key={widgetKey} role={role} />
        </div>
      </main>
    </div>
  );
}
