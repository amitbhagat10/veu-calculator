"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CalculatorForm from "@/components/CalculatorForm";
import DashboardWidgets from "@/components/DashboardWidgets";
import JobCards from "@/components/JobCards";

export default function DashboardPage() {

  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 Check authentication
  useEffect(() => {

    const checkUser = async () => {

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setLoading(false);
      }

    };

    checkUser();

  }, [router]);

  // Prevent flash before auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f7]">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="ml-80 p-8">

        <Header />

        <div className="mt-10">

          <DashboardWidgets />

          <CalculatorForm />

          <div className="mt-10">
            <JobCards />
          </div>

        </div>

      </div>

    </div>
  );
}