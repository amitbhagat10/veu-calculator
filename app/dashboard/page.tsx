"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CalculatorForm from "@/components/CalculatorForm";
import DashboardWidgets from "@/components/DashboardWidgets";

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");

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
          {/* Stats */}
          <DashboardWidgets />

          {/* Calculator */}
          <CalculatorForm />
        </div>
      </main>
    </div>
  );
}
