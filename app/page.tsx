"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CalculatorForm from "@/components/CalculatorForm";

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 md:p-14">
          <CalculatorForm />
        </main>
      </div>
    </div>
  );
}