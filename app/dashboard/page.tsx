"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");

  const [activities, setActivities] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [postcode, setPostcode] = useState("");
  const [jobDate, setJobDate] = useState("");

  const [rebateResult, setRebateResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data?.user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setRole(userData?.role?.toLowerCase().trim() || "installer");
  };

  const fetchActivities = async () => {
    const { data } = await supabase.from("activities").select("*").order("name");
    if (data) setActivities(data);
  };

  const fetchScenarios = async (activityId: string) => {
    const { data } = await supabase
      .from("scenarios")
      .select("*")
      .eq("activity_id", activityId)
      .order("name");

    if (data) setScenarios(data);
  };

  const fetchBrands = async (activityId: string) => {
    const { data } = await supabase
      .from("brands")
      .select("*")
      .eq("activity_id", activityId)
      .order("name");

    if (data) setBrands(data);
  };

  const fetchProducts = async (brandId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("brand_id", brandId)
      .order("model_name");

    if (data) setProducts(data);
  };

  const handleActivityChange = (value: string) => {
    setSelectedActivity(value);
    setSelectedScenario("");
    setSelectedBrand("");
    setSelectedProduct("");
    setScenarios([]);
    setBrands([]);
    setProducts([]);
    setRebateResult(null);

    if (value) {
      fetchScenarios(value);
      fetchBrands(value);
    }
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setSelectedProduct("");
    setProducts([]);
    setRebateResult(null);

    if (value) {
      fetchProducts(value);
    }
  };

  const handleCalculate = async () => {
    if (!selectedActivity || !selectedScenario || !selectedProduct || !postcode || !jobDate) {
      alert("Please complete all fields");
      return;
    }

    setLoading(true);
    setRebateResult(null);

    const { data, error } = await supabase.rpc("calculate_rebate", {
      p_product_id: selectedProduct,
      p_postcode: Number(postcode),
      p_job_date: jobDate,
      p_activity_id: selectedActivity,
      p_scenario_id: selectedScenario,
    });

    setLoading(false);

    if (error) {
      alert("Calculation error");
      return;
    }

    setRebateResult(data ?? 0);
  };

  const handleReset = () => {
    setSelectedActivity("");
    setSelectedScenario("");
    setSelectedBrand("");
    setSelectedProduct("");
    setPostcode("");
    setJobDate("");
    setScenarios([]);
    setBrands([]);
    setProducts([]);
    setRebateResult(null);
  };

  const selectedBrandLabel =
    brands.find((b) => b.id === selectedBrand)?.name || "";

  const selectedProductLabel =
    products.find((p) => p.id === selectedProduct)?.model_name || "";

  const selectedScenarioLabel =
    scenarios.find((s) => s.id === selectedScenario)?.name || "";

  return (
    <div className="flex min-h-screen bg-[#eef2f7]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role={role}
      />

      <main className={`flex-1 p-14 transition-all duration-300 ${collapsed ? "ml-32" : "ml-80"}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] text-white p-6 rounded-xl shadow-lg mb-10">
          <h1 className="text-2xl font-bold">
            VEU Rebate Calculator
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-5xl mx-auto">
          {/* Activity */}
          <div className="mb-8">
            <label className="block font-semibold text-gray-900 mb-2">
              Activity
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => handleActivityChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Select Activity</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario */}
          <AnimatePresence>
            {selectedActivity && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-8"
              >
                <label className="block font-semibold text-gray-900 mb-2">
                  Scenario
                </label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
                >
                  <option value="">Select Scenario</option>
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Section */}
          <AnimatePresence>
            {selectedActivity && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-10"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Product
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">
                      Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">
                      Model
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
                    >
                      <option value="">Select Model</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.model_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Job Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Date
              </label>
              <input
                type="date"
                value={jobDate}
                onChange={(e) => setJobDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Postcode
              </label>
              <input
                type="text"
                maxLength={4}
                value={postcode}
                onChange={(e) =>
                  setPostcode(e.target.value.replace(/\D/g, ""))
                }
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Reset
            </button>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
          </div>

          {/* Result */}
          <AnimatePresence>
            {rebateResult !== null && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`mt-10 p-6 rounded-xl shadow ${
                  rebateResult > 0
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {rebateResult > 0 ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle size={28} />
                      <div className="text-lg font-semibold">
                        Eligible Rebate
                      </div>
                    </div>

                    <div className="text-gray-700 mb-1">
                      <span className="font-semibold">Scenario:</span> {selectedScenarioLabel}
                    </div>
                    <div className="text-gray-700 mb-1">
                      <span className="font-semibold">Product:</span> {selectedBrandLabel} {selectedProductLabel}
                    </div>

                    <div className="text-3xl font-bold mt-3">
                      ${Number(rebateResult).toLocaleString()}
                    </div>

                    <div className="text-sm mt-1 text-gray-500">
                      + GST
                    </div>
                  </>
                ) : (
                  <div className="font-semibold">
                    Not Eligible for Rebate
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}