"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [postcode, setPostcode] = useState("");
  const [jobDate, setJobDate] = useState("");

  const [rebateResult, setRebateResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data } = await supabase.from("activities").select("*");
    if (data) setActivities(data);
  };

  const fetchBrands = async (activityId: string) => {
    const { data } = await supabase
      .from("brands")
      .select("*")
      .eq("activity_id", activityId);
    if (data) setBrands(data);
  };

  const fetchProducts = async (brandId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("brand_id", brandId);
    if (data) setProducts(data);
  };

  const handleActivityChange = (value: string) => {
    setSelectedActivity(value);
    setSelectedBrand("");
    setSelectedProduct("");
    setBrands([]);
    setProducts([]);
    setRebateResult(null);
    fetchBrands(value);
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setSelectedProduct("");
    setProducts([]);
    setRebateResult(null);
    fetchProducts(value);
  };

  const handleCalculate = async () => {
    if (!selectedProduct || !postcode || !jobDate) {
      alert("Please complete all fields");
      return;
    }

    setLoading(true);
    setRebateResult(null);

    const { data, error } = await supabase.rpc("calculate_rebate", {
      p_product_id: selectedProduct,
      p_postcode: Number(postcode),
      p_job_date: jobDate,
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
    setSelectedBrand("");
    setSelectedProduct("");
    setPostcode("");
    setJobDate("");
    setBrands([]);
    setProducts([]);
    setRebateResult(null);
  };

  return (
    <div className="flex min-h-screen bg-[#eef2f7]">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0C1E3B] text-white p-6 min-h-screen">

        {/* Transparent Logo */}
        <div className="flex justify-center mb-10">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-20 h-auto"
          />
        </div>

        <nav className="space-y-2 text-sm">
          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-1 bg-orange-500 rounded-r"></div>
            <div className="pl-4 py-3 bg-white/10 rounded-lg font-medium">
              Calculator
            </div>
          </div>

          <div className="pl-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer transition">
            Users
          </div>

          <div className="pl-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer transition">
            Jobs
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-14">

        {/* Top Branded Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] text-white p-6 rounded-xl shadow-lg mb-10">
          <h1 className="text-2xl font-bold">
            VEU Rebate Calculator
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-4xl mx-auto">

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

          {/* Product Section */}
          <AnimatePresence>
            {selectedActivity && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-10"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Product
                </h2>

                <div className="grid grid-cols-2 gap-6">
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
          <div className="grid grid-cols-2 gap-6 mb-12">
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
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition"
            >
              Reset
            </button>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="bg-indigo-700 text-white px-8 py-3 rounded-lg shadow hover:shadow-lg transition"
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
                transition={{ duration: 0.3 }}
                className={`mt-10 p-6 rounded-xl text-center shadow ${
                  rebateResult > 0
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {rebateResult > 0 ? (
                  <>
                    <CheckCircle className="mx-auto mb-3" size={36} />
                    <div className="text-lg font-semibold">
                      Eligible Rebate
                    </div>
                    <div className="text-3xl font-bold mt-2">
                      ${Number(rebateResult).toLocaleString()}
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