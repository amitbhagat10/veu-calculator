"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CalculatorForm() {
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

    const { data, error } = await supabase.rpc(
      "calculate_veu_rebate",
      {
        p_activity_id: selectedActivity,
        p_product_id: selectedProduct,
      }
    );

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

  const selectedBrandLabel =
    brands.find((b) => b.id === selectedBrand)?.name || "";

  const selectedProductLabel =
    products.find((p) => p.id === selectedProduct)?.model_name || "";

  const selectedActivityLabel =
    activities.find((a) => a.id === selectedActivity)?.name || "";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto transition-colors duration-500">

      {/* Activity */}
      <div className="mb-8">
        <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Activity
        </label>
        <select
          value={selectedActivity}
          onChange={(e) => handleActivityChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-slate-600 
          bg-white dark:bg-slate-700 
          text-gray-900 dark:text-white 
          p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 
                bg-white dark:bg-slate-700 
                text-gray-900 dark:text-white 
                p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 
                bg-white dark:bg-slate-700 
                text-gray-900 dark:text-white 
                p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Model</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.model_name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date & Postcode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <input
          type="date"
          value={jobDate}
          onChange={(e) => setJobDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-slate-600 
          bg-white dark:bg-slate-700 
          text-gray-900 dark:text-white 
          p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          maxLength={4}
          value={postcode}
          onChange={(e) =>
            setPostcode(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Postcode"
          className="w-full rounded-lg border border-gray-300 dark:border-slate-600 
          bg-white dark:bg-slate-700 
          text-gray-900 dark:text-white 
          placeholder-gray-400 
          p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
        >
          Reset
        </button>

        <button
          onClick={handleCalculate}
          className="bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {rebateResult !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 bg-slate-50 dark:bg-slate-700 rounded-2xl shadow-xl transition-colors"
          >
            {rebateResult > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Scenario Result
                  </h3>
                </div>

                <div className="mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBrandLabel} {selectedProductLabel}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {selectedActivityLabel}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t pt-6">
                  <span className="text-gray-600 dark:text-gray-300">
                    Government Rebate
                  </span>
                  <span className="text-3xl font-bold text-green-600">
                    ${Number(rebateResult).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                  + GST
                </div>
              </>
            ) : (
              <div className="text-red-600 font-semibold">
                Not Eligible
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}