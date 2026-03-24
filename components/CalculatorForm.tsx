"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ResultCard from "@/components/ResultCard";

export default function CalculatorForm() {
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
  }, []);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching activities:", error);
      return;
    }

    if (data) setActivities(data);
  };

  const fetchScenarios = async (activityId: string) => {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("activity_id", activityId)
      .order("name");

    if (error) {
      console.error("Error fetching scenarios:", error);
      return;
    }

    if (data) setScenarios(data);
  };

  const fetchBrands = async (activityId: string) => {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("activity_id", activityId)
      .order("name");

    if (error) {
      console.error("Error fetching brands:", error);
      return;
    }

    if (data) setBrands(data);
  };

  const fetchProducts = async (brandId: string, scenarioId?: string) => {
    let query = supabase
      .from("products")
      .select("*")
      .eq("brand_id", brandId)
      .order("model_name");

    if (scenarioId) {
      query = query.eq("scenario_id", scenarioId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }

    if (data) setProducts(data);
  };

  const selectedActivityLabel =
    activities.find((a) => a.id === selectedActivity)?.name || "";

  const hideScenario =
    selectedActivityLabel === "Water Heating - New Install / No Decommissioning";

  const handleActivityChange = async (value: string) => {
    setSelectedActivity(value);
    setSelectedScenario("");
    setSelectedBrand("");
    setSelectedProduct("");

    setScenarios([]);
    setBrands([]);
    setProducts([]);
    setRebateResult(null);

    if (!value) return;

    await fetchBrands(value);

    const activityRow = activities.find((a) => a.id === value);
    const activityName = activityRow?.name || "";

    if (activityName !== "Water Heating - New Install / No Decommissioning") {
      await fetchScenarios(value);
    }
  };

  const handleScenarioChange = async (value: string) => {
    setSelectedScenario(value);
    setSelectedBrand("");
    setSelectedProduct("");
    setProducts([]);
    setRebateResult(null);
  };

  const handleBrandChange = async (value: string) => {
    setSelectedBrand(value);
    setSelectedProduct("");
    setProducts([]);
    setRebateResult(null);

    if (!value) return;

    if (hideScenario) {
      await fetchProducts(value);
      return;
    }

    if (!selectedScenario) return;

    await fetchProducts(value, selectedScenario);
  };

  const handleCalculate = async () => {
    if (
      !selectedActivity ||
      !selectedBrand ||
      !selectedProduct ||
      !postcode ||
      !jobDate
    ) {
      alert("Please complete all fields");
      return;
    }

    if (!hideScenario && !selectedScenario) {
      alert("Please select a scenario");
      return;
    }

    setLoading(true);
    setRebateResult(null);

    const { data, error } = await supabase
      .from("products")
      .select("rebate_amount")
      .eq("id", selectedProduct)
      .single();

    setLoading(false);

    if (error) {
      console.error("Calculation error:", error);
      alert("Calculation error");
      return;
    }

    setRebateResult(Number(data?.rebate_amount ?? 0));
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Grant Calculator
        </h2>

        <p className="text-gray-600 text-sm">
          Calculate the available VEU rebate for selected products.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 md:p-10">
        {/* Activity */}
        <div className="mb-8">
          <label className="block font-semibold mb-2 text-gray-800">
            Activity
          </label>

          <select
            value={selectedActivity}
            onChange={(e) => handleActivityChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3 focus:ring-2 focus:ring-orange-500"
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
        {selectedActivity && !hideScenario && (
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-gray-800">
              Scenario
            </label>

            <select
              value={selectedScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3 focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Scenario</option>

              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Product Section */}
        {selectedActivity && (
          <div className="mb-10">
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
                  disabled={!hideScenario && !selectedScenario}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 disabled:bg-gray-100"
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
                  disabled={!selectedBrand}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 disabled:bg-gray-100"
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
          </div>
        )}

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
        {rebateResult !== null && (
          <ResultCard
            rebateResult={rebateResult}
            brand={selectedBrandLabel}
            model={selectedProductLabel}
            activity={selectedActivityLabel}
            scenario={hideScenario ? "" : selectedScenarioLabel}
          />
        )}
      </div>
    </div>
  );
}