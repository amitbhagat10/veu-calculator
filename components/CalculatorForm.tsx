"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ResultCard from "./ResultCard";

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

  /* ================= FETCH DATA ================= */
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

  /* ================= CALCULATE ================= */
  const handleCalculate = async () => {
    if (!selectedProduct) {
      alert("Please select model");
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

  /* ================= RESET ================= */
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

  /* ================= LABELS ================= */
  const selectedBrandLabel =
    brands.find((b) => b.id === selectedBrand)?.name || "";

  const selectedProductLabel =
    products.find((p) => p.id === selectedProduct)?.model_name || "";

  const selectedActivityLabel =
    activities.find((a) => a.id === selectedActivity)?.name || "";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto transition-colors">

      {/* Activity */}
      <div className="mb-8">
        <label className="block font-semibold mb-2">
          Activity
        </label>
        <select
          value={selectedActivity}
          onChange={(e) => {
            setSelectedActivity(e.target.value);
            setSelectedBrand("");
            setSelectedProduct("");
            setRebateResult(null);
            fetchBrands(e.target.value);
          }}
          className="w-full border rounded-lg p-3"
        >
          <option value="">Select Activity</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand & Model */}
      {selectedActivity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedProduct("");
              fetchProducts(e.target.value);
            }}
            className="border rounded-lg p-3"
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
            onChange={(e) =>
              setSelectedProduct(e.target.value)
            }
            className="border rounded-lg p-3"
          >
            <option value="">Select Model</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.model_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date & Postcode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <input
          type="date"
          value={jobDate}
          onChange={(e) => setJobDate(e.target.value)}
          className="border rounded-lg p-3"
        />
        <input
          type="text"
          value={postcode}
          onChange={(e) =>
            setPostcode(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Postcode"
          className="border rounded-lg p-3"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-6 py-3 rounded-lg"
        >
          Reset
        </button>

        <button
          onClick={handleCalculate}
          className="bg-indigo-700 text-white px-6 py-3 rounded-lg"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {/* Result */}
      {rebateResult !== null && (
        <ResultCard
          rebateResult={rebateResult}
          brand={selectedBrandLabel}
          model={selectedProductLabel}
          activity={selectedActivityLabel}
        />
      )}
    </div>
  );
}