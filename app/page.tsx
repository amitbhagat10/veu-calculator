"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CalculatorForm from "@/components/CalculatorForm";
import DashboardWidgets from "@/components/DashboardWidgets";
import JobCards from "@/components/JobCards";

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="
      min-h-screen
      bg-gradient-to-br
      from-[#020617]
      via-[#0b1f3a]
      to-[#020617]
    "
    >
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