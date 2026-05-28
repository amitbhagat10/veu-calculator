"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  DollarSign,
  Hash,
  MapPin,
  Package,
  RefreshCw,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type JobStatus = "Pending" | "Approved" | "Rejected";

type JobRow = {
  id: string;
  user_id?: string | null;
  customer_name?: string | null;
  suburb?: string | null;
  postcode?: number | string | null;
  job_date?: string | null;
  created_at?: string | null;
  status?: JobStatus | string | null;
  veec_count?: number | string | null;
  rebate_value?: number | string | null;
  calculated_rebate?: number | string | null;
  veec_price?: number | string | null;
  product_id?: string | null;
  activity_id?: string | null;
  scenario_id?: string | null;
  product?: any;
  products?: any;
  activity?: any;
  activities?: any;
  scenario?: any;
  scenarios?: any;
  installer?: any;
};

const STATUS_OPTIONS: JobStatus[] = ["Pending", "Approved", "Rejected"];

const statusStyle: Record<JobStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};

function asStatus(value: any): JobStatus {
  if (value === "Approved" || value === "Rejected" || value === "Pending") {
    return value;
  }
  return "Pending";
}

function formatCurrency(value: number | string | null | undefined) {
  const n = Number(value || 0);
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function JobCards(_props: { role?: string }) {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"All" | JobStatus>("All");
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (filter === "All") return jobs;
    return jobs.filter((job) => asStatus(job.status) === filter);
  }, [jobs, filter]);

  const fetchUserRole = async (userId: string) => {
    let adminFlag = false;

    const userLookup = await supabase
      .from("users")
      .select("id, role, full_name, name, email")
      .eq("id", userId)
      .maybeSingle();

    if (!userLookup.error && userLookup.data) {
      adminFlag = String(userLookup.data.role || "").toLowerCase() === "admin";
      setIsAdmin(adminFlag);
      return adminFlag;
    }

    const profileLookup = await supabase
      .from("profiles")
      .select("id, role, full_name, name, email")
      .eq("id", userId)
      .maybeSingle();

    if (!profileLookup.error && profileLookup.data) {
      adminFlag = String(profileLookup.data.role || "").toLowerCase() === "admin";
    }

    setIsAdmin(adminFlag);
    return adminFlag;
  };

  const fetchJobs = async () => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.warn("User not available for jobs list", userError);
      setJobs([]);
      setLoading(false);
      return;
    }

    const userId = userData.user.id;
    const adminFlag = await fetchUserRole(userId);

    let jobQuery = supabase.from("jobs").select("*");

    if (!adminFlag) {
      jobQuery = jobQuery.eq("user_id", userId);
    }

    let { data: jobRows, error: jobError } = await jobQuery.order("created_at", {
      ascending: false,
    });

    // Some old jobs tables do not have created_at. Retry without ordering.
    if (jobError) {
      let retryQuery = supabase.from("jobs").select("*");
      if (!adminFlag) {
        retryQuery = retryQuery.eq("user_id", userId);
      }
      const retry = await retryQuery;
      jobRows = retry.data;
      jobError = retry.error;
    }

    if (jobError) {
      // Use warn, not error, so Next.js does not show the red development overlay.
      console.warn("Jobs could not be loaded. Showing empty jobs list.", {
        message: jobError.message,
        details: jobError.details,
        hint: jobError.hint,
        code: jobError.code,
      });
      setJobs([]);
      setLoading(false);
      return;
    }

    const jobsData = jobRows || [];

    const productIds = [...new Set(jobsData.map((j) => j.product_id).filter(Boolean))];
    const activityIds = [...new Set(jobsData.map((j) => j.activity_id).filter(Boolean))];
    const scenarioIds = [...new Set(jobsData.map((j) => j.scenario_id).filter(Boolean))];
    const installerIds = [...new Set(jobsData.map((j) => j.user_id).filter(Boolean))];

    let products: any[] = [];
    let brands: any[] = [];
    let activities: any[] = [];
    let scenarios: any[] = [];
    let installers: any[] = [];

    if (productIds.length > 0) {
      const { data } = await supabase
        .from("products")
        .select("id, model_name, brand_id, veu_category")
        .in("id", productIds);
      products = data || [];
    }

    const brandIds = [...new Set(products.map((p) => p.brand_id).filter(Boolean))];

    if (brandIds.length > 0) {
      const { data } = await supabase
        .from("brands")
        .select("id, name")
        .in("id", brandIds);
      brands = data || [];
    }

    if (activityIds.length > 0) {
      const { data } = await supabase
        .from("activities")
        .select("id, name")
        .in("id", activityIds);
      activities = data || [];
    }

    if (scenarioIds.length > 0) {
      const { data } = await supabase
        .from("scenarios")
        .select("id, name, veu_scenario_code")
        .in("id", scenarioIds);
      scenarios = data || [];
    }

    if (installerIds.length > 0) {
      const { data } = await supabase
        .from("users")
        .select("id, full_name, name, email")
        .in("id", installerIds);
      installers = data || [];
    }

    const brandMap = new Map(brands.map((b) => [b.id, b]));
    const productMap = new Map(
      products.map((p) => [
        p.id,
        {
          ...p,
          brand: brandMap.get(p.brand_id) || null,
          brands: brandMap.get(p.brand_id) || null,
        },
      ])
    );
    const activityMap = new Map(activities.map((a) => [a.id, a]));
    const scenarioMap = new Map(scenarios.map((s) => [s.id, s]));
    const installerMap = new Map(installers.map((i) => [i.id, i]));

    const enrichedJobs = jobsData.map((job) => ({
      ...job,
      product: productMap.get(job.product_id) || null,
      products: productMap.get(job.product_id) || null,
      activity: activityMap.get(job.activity_id) || null,
      activities: activityMap.get(job.activity_id) || null,
      scenario: scenarioMap.get(job.scenario_id) || null,
      scenarios: scenarioMap.get(job.scenario_id) || null,
      installer: installerMap.get(job.user_id) || null,
    }));

    setJobs(enrichedJobs);
    setLoading(false);
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (error) {
      console.warn("Status update failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setUpdatingId(null);
      return;
    }

    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
    );

    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          {isAdmin ? "All Jobs" : "My Jobs"}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filteredJobs.length} {filter === "All" ? "total" : filter.toLowerCase()})
          </span>
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {(["All", "Pending", "Approved", "Rejected"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  filter === item
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={fetchJobs}
            className="p-2 text-gray-400 transition hover:text-gray-700"
            title="Refresh jobs"
            type="button"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <Briefcase className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-medium">
            No {filter === "All" ? "" : filter.toLowerCase()} jobs found
          </p>
          <p className="mt-1 text-sm">
            {filter === "All"
              ? "Use the calculator above to create your first job."
              : `No ${filter.toLowerCase()} jobs yet.`}
          </p>
        </div>
      )}

      <AnimatePresence>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredJobs.map((job, index) => {
            const status = asStatus(job.status);
            const product = job.product || job.products;
            const activity = job.activity || job.activities;
            const scenario = job.scenario || job.scenarios;
            const installer = job.installer;
            const rebate = job.rebate_value ?? job.calculated_rebate ?? 0;

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.customer_name || "Unknown Customer"}
                    </h3>

                    <p className="mt-0.5 text-sm text-gray-500">
                      {job.suburb || "—"}
                      {job.postcode ? `, ${job.postcode}` : ""}
                    </p>

                    {isAdmin && installer && (
                      <p className="mt-1 text-xs font-medium text-blue-600">
                        Installer: {installer.full_name || installer.name || installer.email || "Unknown"}
                      </p>
                    )}
                  </div>

                  {isAdmin ? (
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        disabled={updatingId === job.id}
                        className={`cursor-pointer appearance-none rounded-lg border px-3 py-1.5 pr-7 text-xs font-medium focus:outline-none ${
                          statusStyle[status]
                        }`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="pointer-events-none absolute right-2 top-2.5 opacity-50"
                      />
                    </div>
                  ) : (
                    <span
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${statusStyle[status]}`}
                    >
                      {status}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Package size={16} className="mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {product?.brand?.name || product?.brands?.name || "Selected product"}
                      </p>
                      <p className="text-gray-500">
                        {activity?.name?.replace("Space heating and cooling - ", "") || ""}
                        {product?.model_name ? ` · ${product.model_name}` : ""}
                        {product?.veu_category ? ` · ${product.veu_category}` : ""}
                      </p>
                      {scenario?.name && (
                        <p className="text-xs text-gray-400">Scenario: {scenario.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 flex items-center gap-1 text-xs text-gray-400">
                        <Hash size={13} /> VEECs
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Number(job.veec_count || 0)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 flex items-center gap-1 text-xs text-gray-400">
                        <DollarSign size={13} /> Rebate
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(rebate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {formatDate(job.job_date || job.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {job.postcode || "—"}
                    </span>
                    {installer && (
                      <span className="flex items-center gap-1">
                        <User size={13} /> {installer.full_name || installer.name || "Installer"}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
