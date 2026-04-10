"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import JobCards from "@/components/JobCards";
import DashboardWidgets from "@/components/DashboardWidgets";

export default function JobsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      router.push("/login");
      return;
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-gray-500 text-sm mb-8">
            View and manage your installation jobs
          </p>

          {/* Stats widgets */}
          <DashboardWidgets role={role} />

          {/* Job cards */}
          <JobCards role={role} />
        </div>
      </main>
    </div>
  );
}
