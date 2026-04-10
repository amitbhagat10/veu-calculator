"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Search, Plus } from "lucide-react";

interface Job {
  id: string;
  job_number?: number;
  job_date?: string;
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_address?: string;
  suburb?: string;
  postcode?: string;
  job_type?: string;
  veu_status?: string;
  cer_status?: string;
  progress?: number;
  activity?: { name: string };
  [key: string]: any;
}

const veuBadge: Record<string, string> = {
  "Draft":              "bg-gray-100 text-gray-500",
  "Pending":            "bg-yellow-100 text-yellow-700",
  "Veu Submitted":      "bg-emerald-100 text-emerald-700",
  "Regulator Approved": "bg-green-100 text-green-700",
  "Approved":           "bg-green-100 text-green-700",
  "Rejected":           "bg-red-100 text-red-600",
};
const cerBadge: Record<string, string> = {
  "Approved": "bg-green-100 text-green-700",
  "Pending":  "bg-yellow-100 text-yellow-700",
};

export default function AdminJobsPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole]           = useState("admin");
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { router.push("/login"); return; }
    const { data: u } = await supabase.from("users").select("role").eq("id", auth.user.id).single();
    setRole(u?.role?.toLowerCase() ?? "admin");
    await fetchJobs();
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select("*, activity:activities(name)")
      .order("created_at", { ascending: false });
    setJobs((data as Job[]) ?? []);
    setLoading(false);
  };

  const handleCreate = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const { data: job } = await supabase.from("jobs").insert({
      user_id:    auth?.user?.id,
      job_date:   new Date().toISOString().split("T")[0],
      veu_status: "Draft", cer_status: "--",
      status:     "Pending", progress:  0,
      job_type:   "Space Heating Cooling",
    }).select().single();
    if (job) router.push(`/admin/jobs/${job.id}`);
  };

  const getName = (j: Job) =>
    [j.customer_first_name, j.customer_last_name].filter(Boolean).join(" ")
    || j.customer_name || "—";

  const getAddr = (j: Job) => {
    const s = [j.customer_address || j.suburb, j.postcode ? `${j.postcode}, VIC` : "VIC"]
      .filter(Boolean).join(", ");
    return s.length > 44 ? s.slice(0, 44) + "…" : s;
  };

  const getType = (j: Job) =>
    (j.activity?.name || j.job_type || "Space Heating Cooling")
      .replace("Space heating and cooling - High efficiency air conditioning", "Space Heating Cooling");

  const statuses = ["All","Draft","Pending","Veu Submitted","Regulator Approved","Approved","Rejected"];

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const nameMatch = !q
      || getName(j).toLowerCase().includes(q)
      || (j.suburb ?? "").toLowerCase().includes(q)
      || String(j.job_number ?? "").includes(q);
    return nameMatch && (statusFilter === "All" || j.veu_status === statusFilter);
  });

  const ml = collapsed ? 120 : 304;

  return (
    <div className="flex min-h-screen bg-[#eef2f7]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={role} />

      <main className="flex-1 min-w-0 transition-all duration-300" style={{ marginLeft: ml }}>
        <Header />
        <div className="p-8">

          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold text-[#1a2e5a]">Jobs</h1>
              <div className="w-12 h-1 bg-[#c8ff00] rounded mt-1" />
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-[#1a2e5a] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#243a70] transition text-sm shadow-sm"
            >
              <Plus size={16} /> Create Job
            </button>
          </div>

          {/* Search + filter */}
          <div className="flex gap-3 mt-6 mb-5 flex-wrap items-center">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search field"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === s
                      ? "bg-[#1a2e5a] text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["ID","Activity Date","Customer Name / Address","Job Type","Status ▾","CER Status","VEU Status","Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {[...Array(8)].map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-gray-400 text-sm">
                        No jobs found
                      </td>
                    </tr>
                  ) : filtered.map(job => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                        {job.job_number || job.id.slice(0, 6).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {job.job_date
                          ? new Date(job.job_date).toLocaleDateString("en-AU", {
                              day: "numeric", month: "long", year: "numeric"
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{getName(job)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{getAddr(job)}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{getType(job)}</td>
                      <td className="px-5 py-4">
                        {job.veu_status && job.veu_status !== "--" ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${veuBadge[job.veu_status] ?? "bg-gray-100 text-gray-600"}`}>
                            {job.veu_status}
                          </span>
                        ) : <span className="text-gray-300 text-sm">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {job.cer_status && job.cer_status !== "--" ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cerBadge[job.cer_status] ?? "bg-gray-100 text-gray-600"}`}>
                            {job.cer_status}
                          </span>
                        ) : <span className="text-gray-300 text-sm">–</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-300 text-sm">–</td>
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
          </div>
        </div>
      </main>
    </div>
  );
}
