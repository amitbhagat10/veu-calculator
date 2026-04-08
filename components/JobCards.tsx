"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RefreshCw } from "lucide-react";

interface Job {
  id: string;
  customer_name: string;
  suburb: string;
  postcode: string;
  calculated_rebate: number;
  veec_count: number;
  status: "Pending" | "Approved" | "Rejected";
  job_date: string;
  created_at: string;
  user_id: string;
  product?: { model_name: string };
  activity?: { name: string };
  installer?: { full_name: string };
}

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"] as const;

const statusStyle = {
  Approved: "bg-green-100 text-green-700 border border-green-200",
  Pending:  "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Rejected: "bg-red-100 text-red-700 border border-red-200",
};

export default function JobCards({ role }: { role?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  useEffect(() => {
    fetchJobs();
  }, [role]);

  const fetchJobs = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const isAdmin = role === "admin";

    let query = supabase
      .from("jobs")
      .select(`
        *,
        product:products(model_name),
        activity:activities(name)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!isAdmin && userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      setLoading(false);
      return;
    }

    // If admin, fetch installer names
    if (isAdmin && data) {
      const userIds = [...new Set(data.map((j: any) => j.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", userIds);

        const usersMap = Object.fromEntries(
          (usersData || []).map((u: any) => [u.id, u.full_name])
        );

        setJobs(data.map((j: any) => ({
          ...j,
          installer: { full_name: usersMap[j.user_id] || "Unknown" },
        })));
      } else {
        setJobs(data || []);
      }
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (!error) {
      setJobs((prev) =>
        prev.map((j) => j.id === jobId ? { ...j, status: newStatus as any } : j)
      );
    }

    setUpdatingId(null);
  };

  const filteredJobs = filter === "All"
    ? jobs
    : jobs.filter((j) => j.status === filter);

  const isAdmin = role === "admin";

  if (loading) {
    return (
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/3 mb-6" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Header + Filter */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          {isAdmin ? "All Jobs" : "My Jobs"}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filteredJobs.length} {filter === "All" ? "total" : filter.toLowerCase()})
          </span>
        </h2>

        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex gap-2">
            {(["All", "Pending", "Approved", "Rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchJobs}
            className="p-2 text-gray-400 hover:text-gray-700 transition"
            title="Refresh jobs"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* No jobs */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Briefcase className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-medium">No {filter === "All" ? "" : filter.toLowerCase()} jobs found</p>
          <p className="text-sm mt-1">
            {filter === "All"
              ? "Use the calculator above to create your first job."
              : `No ${filter.toLowerCase()} jobs yet.`}
          </p>
        </div>
      )}

      {/* Job Cards Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              {/* Top row */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.customer_name || "Unknown Customer"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {job.suburb || "—"}{job.postcode ? `, ${job.postcode}` : ""}
                  </p>
                  {isAdmin && job.installer && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      Installer: {job.installer.full_name}
                    </p>
                  )}
                </div>

                {/* Status — admin can change, installer sees badge */}
                {isAdmin ? (
                  <div className="relative">
                    <select
                      value={job.status || "Pending"}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      disabled={updatingId === job.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border appearance-none pr-7 cursor-pointer focus:outline-none ${
                        statusStyle[job.status as keyof typeof statusStyle] || statusStyle.Pending
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-2.5 pointer-events-none opacity-50" />
                  </div>
                ) : (
                  <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    statusStyle[job.status as keyof typeof statusStyle] || statusStyle.Pending
                  }`}>
                    {job.status || "Pending"}
                  </span>
                )}
              </div>

              {/* Product */}
              {job.product && (
                <p className="text-sm text-gray-500 mb-4 truncate">
                  {job.activity?.name?.replace("Space heating and cooling - ", "") || ""}
                  {job.product.model_name ? ` · ${job.product.model_name}` : ""}
                </p>
              )}

              {/* Bottom row */}
              <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-orange-500">
                    ${Number(job.calculated_rebate || 0).toLocaleString("en-AU", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {job.veec_count ? `${job.veec_count} VEECs · ` : ""}
                    {job.job_date
                      ? new Date(job.job_date).toLocaleDateString("en-AU")
                      : "No date"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

// Fix missing import
function Briefcase({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
