"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Briefcase, DollarSign, Users, Clock } from "lucide-react";

interface WidgetData {
  totalJobs: number;
  approvedRebates: number;
  installers: number;
  pendingJobs: number;
}

export default function DashboardWidgets({ role }: { role?: string }) {
  const [data, setData] = useState<WidgetData>({
    totalJobs: 0,
    approvedRebates: 0,
    installers: 0,
    pendingJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWidgetData();
  }, [role]);

  const fetchWidgetData = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const isAdmin = role === "admin";

    // Total Jobs
    let jobsQuery = supabase.from("jobs").select("*", { count: "exact", head: true });
    if (!isAdmin && userId) jobsQuery = jobsQuery.eq("user_id", userId);
    const { count: totalJobs } = await jobsQuery;

    // Approved Rebates (sum of calculated_rebate where status = Approved)
    let approvedQuery = supabase
      .from("jobs")
      .select("calculated_rebate")
      .eq("status", "Approved");
    if (!isAdmin && userId) approvedQuery = approvedQuery.eq("user_id", userId);
    const { data: approvedJobs } = await approvedQuery;
    const approvedRebates = approvedJobs?.reduce(
      (sum, job) => sum + Number(job.calculated_rebate || 0), 0
    ) || 0;

    // Pending Jobs
    let pendingQuery = supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending");
    if (!isAdmin && userId) pendingQuery = pendingQuery.eq("user_id", userId);
    const { count: pendingJobs } = await pendingQuery;

    // Installers (admin only — count users with role = installer)
    let installerCount = 0;
    if (isAdmin) {
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "installer");
      installerCount = count || 0;
    }

    setData({
      totalJobs:       totalJobs || 0,
      approvedRebates: approvedRebates,
      installers:      installerCount,
      pendingJobs:     pendingJobs || 0,
    });

    setLoading(false);
  };

  const widgets = [
    {
      title: "Total Jobs",
      value: loading ? "..." : data.totalJobs.toString(),
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Approved Rebates",
      value: loading
        ? "..."
        : `$${data.approvedRebates.toLocaleString("en-AU", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    ...(role === "admin"
      ? [{
          title: "Installers",
          value: loading ? "..." : data.installers.toString(),
          icon: Users,
          color: "text-purple-600",
          bg: "bg-purple-50",
        }]
      : []),
    {
      title: "Pending Jobs",
      value: loading ? "..." : data.pendingJobs.toString(),
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className={`grid gap-6 mb-10 ${role === "admin" ? "grid-cols-4" : "grid-cols-3"}`}>
      {widgets.map((w, i) => {
        const Icon = w.icon;
        return (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-sm font-medium">{w.title}</p>
              <div className={`${w.bg} p-2 rounded-lg`}>
                <Icon size={18} className={w.color} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {w.value}
            </h2>
          </div>
        );
      })}
    </div>
  );
}
