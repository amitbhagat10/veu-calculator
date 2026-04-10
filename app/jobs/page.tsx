"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardWidgets from "@/components/DashboardWidgets";
import { Plus, Search, Briefcase } from "lucide-react";

interface Job {
  id: string;
  job_number?: number;
  job_date?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_name?: string;
  customer_address?: string;
  suburb?: string;
  postcode?: string;
  job_type?: string;
  veu_status?: string;
  cer_status?: string;
  [key: string]: any;
}

const statusBadge: Record<string, string> = {
  "Draft":              "bg-gray-100 text-gray-500",
  "Pending":            "bg-yellow-100 text-yellow-700",
  "Veu Submitted":      "bg-emerald-100 text-emerald-700",
  "Regulator Approved": "bg-green-100 text-green-700",
  "Approved":           "bg-green-100 text-green-700",
  "Rejected":           "bg-red-100 text-red-600",
};

export default function JobsPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole]     = useState("");
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) { router.push("/login"); return; }

    // Load role
    const { data: u } = await supabase
      .from("users").select("role").eq("id", authData.user.id).single();
    setRole(u?.role?.toLowerCase().trim() ?? "installer");

    // Load jobs for this user
    setLoading(true);
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });
    setJobs((jobData as Job[]) ?? []);
    setLoading(false);
  };

  const handleCreate = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const { data: job } = await supabase.from("jobs").insert({
      user_id:    authData?.user?.id,
      job_date:   new Date().toISOString().split("T")[0],
      veu_status: "Draft",
      cer_status: "--",
      status:     "Pending",
      progress:   0,
      job_type:   "Space Heating Cooling",
    }).select().single();
    if (job) router.push(`/admin/jobs/${job.id}`);
  };

  const getName = (j: Job) =>
    [j.customer_first_name, j.customer_last_name].filter(Boolean).join(" ")
    || j.customer_name || "—";

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return !q
      || getName(j).toLowerCase().includes(q)
      || (j.suburb ?? "").toLowerCase().includes(q)
      || String(j.job_number ?? "").includes(q)
      || (j.customer_address ?? "").toLowerCase().includes(q);
  });

  // Same margin logic as dashboard - floating card sidebar
  const ml = collapsed ? 120 : 304;

  return (
    <div className="flex min-h-screen bg-[#eef2f7]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={role} />

      <main
        className="flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: ml }}
      >
        <Header />
        <div className="p-8">

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-500 text-sm mt-1">
                View and manage your installation jobs
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition text-sm shadow-sm"
            >
              <Plus size={16} />
              Create Job
            </button>
          </div>

          {/* Stats */}
          <DashboardWidgets role={role} />

          {/* Search */}
          <div className="relative mt-6 mb-4 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, suburb or job #…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-50 flex gap-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-100 rounded animate-pulse flex-1" />
                  ))}
                </div>
              ))}
            </div>

          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 text-center">
              <Briefcase size={44} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-600 font-semibold text-lg">No jobs yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">
                {search ? "No jobs match your search" : "Create your first job to get started"}
              </p>
              {!search && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
                >
                  <Plus size={15} />
                  Create Job
                </button>
              )}
            </div>

          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Job #", "Date", "Customer / Address", "Type", "VEU Status", ""].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(job => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                        {job.job_number || job.id.slice(0, 6).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {job.job_date
                          ? new Date(job.job_date).toLocaleDateString("en-AU", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{getName(job)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[job.customer_address, job.suburb, job.postcode]
                            .filter(Boolean).join(", ")}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {job.job_type || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {job.veu_status && job.veu_status !== "--" ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            statusBadge[job.veu_status] ?? "bg-gray-100 text-gray-600"
                          }`}>
                            {job.veu_status}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/admin/jobs/${job.id}`)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-wide transition"
                        >
                          MANAGE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
