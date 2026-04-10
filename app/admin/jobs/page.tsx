"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Search, Plus } from "lucide-react";

interface Job {
  id: string;
  job_number: number;
  job_date: string;
  customer_name?: string;        // legacy field
  customer_first_name?: string;
  customer_last_name?: string;
  customer_address?: string;
  suburb?: string;
  postcode?: string;
  job_type?: string;
  status?: string;
  veu_status?: string;
  cer_status?: string;
  progress?: number;
  activity?: { name: string };
}

const veuStatusStyle: Record<string, string> = {
  "Draft":              "bg-gray-100 text-gray-600",
  "Pending":            "bg-yellow-100 text-yellow-700",
  "Veu Submitted":      "bg-emerald-100 text-emerald-700",
  "Regulator Approved": "bg-green-100 text-green-700",
  "Approved":           "bg-green-100 text-green-700",
  "Rejected":           "bg-red-100 text-red-600",
};

const cerStatusStyle: Record<string, string> = {
  "Approved": "bg-green-100 text-green-700",
  "Pending":  "bg-yellow-100 text-yellow-700",
  "--":       "text-gray-400",
};

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select(`*, activity:activities(name)`)
      .order("created_at", { ascending: false });
    if (data) setJobs(data as any);
    setLoading(false);
  };

  const filtered = jobs.filter(j => {
    const name = `${j.customer_first_name || ""} ${j.customer_last_name || j.customer_name || ""}`.toLowerCase();
    const addr = `${j.customer_address || j.suburb || ""} ${j.postcode || ""}`.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !search || name.includes(q) || addr.includes(q) || String(j.job_number).includes(q);
    const matchStatus = statusFilter === "All" || j.veu_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: newJob, error } = await supabase
      .from("jobs")
      .insert({
        user_id:    userData?.user?.id,
        job_date:   new Date().toISOString().split("T")[0],
        veu_status: "Draft",
        cer_status: "--",
        status:     "Pending",
        progress:   0,
        job_type:   "Space Heating Cooling",
      })
      .select()
      .single();
    if (!error && newJob) {
      router.push(`/admin/jobs/${newJob.id}`);
    }
  };

  const customerName = (j: Job) =>
    [j.customer_first_name, j.customer_last_name].filter(Boolean).join(" ") || (j as any).customer_name || "—";

  const customerAddr = (j: Job) => {
    const parts = [j.customer_address, j.suburb, j.postcode ? `${j.postcode},` : "", "VIC"].filter(Boolean);
    const full = parts.join(" ");
    return full.length > 40 ? full.slice(0, 40) + "…" : full;
  };

  const jobType = (j: Job) => {
    const name = j.activity?.name || j.job_type || "Space Heating Cooling";
    return name.replace("Space heating and cooling - High efficiency air conditioning", "Space Heating Cooling");
  };

  const statuses = ["All", "Draft", "Pending", "Veu Submitted", "Regulator Approved", "Approved", "Rejected"];

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-[#1a2e5a]">Jobs</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#1a2e5a] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#243a70] transition"
        >
          <Plus size={18} />
          Create Job
        </button>
      </div>
      <div className="w-16 h-1 bg-[#c8ff00] rounded mb-8" />

      {/* Search + Filter */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search field"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === s ? "bg-[#1a2e5a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 w-20">ID</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 w-40">Activity Date</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Customer Name / Address</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Job Type</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                Status
                <span className="ml-1 text-gray-400">▼</span>
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">CER Status</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">VEU Status</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Progress</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {[...Array(9)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-400">No jobs found</td>
              </tr>
            ) : (
              filtered.map(job => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                    {job.job_number || job.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {job.job_date
                      ? new Date(job.job_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-gray-900">{customerName(job)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{customerAddr(job)}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{jobType(job)}</td>
                  <td className="px-5 py-4">
                    {job.veu_status && job.veu_status !== "--" ? (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${veuStatusStyle[job.veu_status] || "bg-gray-100 text-gray-600"}`}>
                        {job.veu_status}
                      </span>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {job.cer_status && job.cer_status !== "--" ? (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cerStatusStyle[job.cer_status] || "bg-gray-100 text-gray-600"}`}>
                        {job.cer_status}
                      </span>
                    ) : <span className="text-gray-400 text-sm">–</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">–</td>
                  <td className="px-5 py-4">
                    {job.progress > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${job.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{job.progress}%</span>
                      </div>
                    ) : <span className="text-gray-400 text-sm">–</span>}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => router.push(`/admin/jobs/${job.id}`)}
                      className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition uppercase tracking-wide"
                    >
                      MANAGE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
