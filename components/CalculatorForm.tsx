"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ResultCard from "@/components/ResultCard";
import { RefreshCw, TrendingUp } from "lucide-react";

export interface VEUResult {
  veec_count: number;
  rebate_value: number;
  ghg_reduction: number;
  heating_savings: number;
  cooling_savings: number;
  gsf_heat: number;
  gsf_cool: number;
  category: string;
  climate_region: string;
  metro_regional: string;
  gems_zone: string;
  hspf_upgrade: number;
  tcspf_upgrade: number;
  veec_price: number;
  btl_heat: number;
  btl_cool: number;
  error?: string;
}

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

  const [veecPrice, setVeecPrice] = useState<number>(83.60);
  const [veecPriceInput, setVeecPriceInput] = useState<string>("83.60");

  const [veuResult, setVeuResult] = useState<VEUResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
    fetchCurrentVeecPrice();
  }, []);

  const fetchCurrentVeecPrice = async () => {
    const { data, error } = await supabase
      .from("veu_global_params")
      .select("param_value")
      .eq("param_name", "VEEC_PRICE")
      .single();

    if (!error && data) {
      const price = Number(data.param_value);
      setVeecPrice(price);
      setVeecPriceInput(price.toFixed(2));
    }
  };

  const handleVeecPriceChange = (value: string) => {
    setVeecPriceInput(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      setVeecPrice(parsed);
      if (veuResult) {
        setVeuResult({
          ...veuResult,
          veec_price: parsed,
          rebate_value: Math.round(veuResult.veec_count * parsed * 100) / 100,
        });
      }
    }
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("name");
    if (!error && data) setActivities(data);
  };

  const fetchScenarios = async (activityId: string) => {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("activity_id", activityId)
      .order("name");
    if (!error && data) setScenarios(data);
  };

  const fetchBrands = async (activityId: string) => {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("activity_id", activityId)
      .order("name");
    if (!error && data) setBrands(data);
  };

  const fetchProducts = async (brandId: string, scenarioId?: string) => {
    let query = supabase
      .from("products")
      .select("*")
      .eq("brand_id", brandId)
      .order("model_name");
    if (scenarioId) query = query.eq("scenario_id", scenarioId);
    const { data, error } = await query;
    if (!error && data) setProducts(data);
  };

  const selectedActivityLabel =
    activities.find((a) => a.id === selectedActivity)?.name || "";

  const hideScenario =
    selectedActivityLabel ===
    "Water Heating - New Install / No Decommissioning";

  const handleActivityChange = async (value: string) => {
    setSelectedActivity(value);
    setSelectedScenario("");
    setSelectedBrand("");
    setSelectedProduct("");
    setScenarios([]);
    setBrands([]);
    setProducts([]);
    setVeuResult(null);
    setCalcError(null);
    if (!value) return;
    await fetchBrands(value);
    const activityName = activities.find((a) => a.id === value)?.name || "";
    if (activityName !== "Water Heating - New Install / No Decommissioning") {
      await fetchScenarios(value);
    }
  };

  const handleScenarioChange = (value: string) => {
    setSelectedScenario(value);
    setSelectedBrand("");
    setSelectedProduct("");
    setProducts([]);
    setVeuResult(null);
    setCalcError(null);
  };

  const handleBrandChange = async (value: string) => {
    setSelectedBrand(value);
    setSelectedProduct("");
    setProducts([]);
    setVeuResult(null);
    setCalcError(null);
    if (!value) return;
    if (hideScenario) {
      await fetchProducts(value);
    } else {
      if (!selectedScenario) return;
      await fetchProducts(value, selectedScenario);
    }
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
    setVeuResult(null);
    setCalcError(null);

    const rpcParams = {
      p_product_id:  selectedProduct,
      p_postcode:    Number(postcode),
      p_job_date:    jobDate,
      p_activity_id: selectedActivity,
      p_scenario_id: selectedScenario || null,
      p_veec_price:  veecPrice,
    };

    // DEBUG — remove after confirming it works
    console.log("=== calculate_rebate RPC params ===", rpcParams);

    const { data, error } = await supabase.rpc("calculate_rebate", rpcParams);

    // DEBUG — remove after confirming it works
    console.log("=== calculate_rebate RPC response ===", { data, error });

    setLoading(false);

    if (error) {
      setCalcError("Calculation error: " + error.message);
      return;
    }

    const result = data as VEUResult;
    if (result?.error) {
      setCalcError(result.error);
      return;
    }

    setVeuResult(result);
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
    setVeuResult(null);
    setCalcError(null);
  };

  const selectedBrandLabel =
    brands.find((b) => b.id === selectedBrand)?.name || "";
  const selectedProductLabel =
    products.find((p) => p.id === selectedProduct)?.model_name || "";
  const selectedScenarioLabel =
    scenarios.find((s) => s.id === selectedScenario)?.name || "";

  const selectClass =
    "w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Grant Calculator
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Calculate the available VEU rebate for selected products.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 md:p-10">

        {/* ── VEEC Spot Price ───────────────────────────────── */}
        <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-blue-600" />
            <label className="font-semibold text-blue-900">
              VEEC Spot Price ($/certificate)
            </label>
          </div>
          <p className="text-xs text-blue-600 mb-4">
            Market price changes daily based on supply &amp; demand. Check
            current price at{" "}
            <a
              href="https://northmoregordon.com/certificate-prices/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-blue-800"
            >
              Northmore Gordon
            </a>{" "}
            or{" "}
            <a
              href="https://www.ecovantage.com.au/victorian-energy-upgrades/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-blue-800"
            >
              Ecovantage
            </a>
            . Current market rate: ~$83.50–$84.00
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-blue-300 rounded-lg px-3 py-2">
              <span className="text-gray-500 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="200"
                value={veecPriceInput}
                onChange={(e) => handleVeecPriceChange(e.target.value)}
                className="w-24 text-gray-900 font-bold text-lg focus:outline-none bg-transparent"
              />
            </div>
            <span className="text-gray-500 text-sm">per VEEC (excl. GST)</span>
            {veuResult && (
              <div className="ml-auto flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                <span className="text-xs text-orange-600 font-medium">
                  Live rebate:
                </span>
                <span className="text-orange-600 font-bold">
                  ${(veuResult.veec_count * veecPrice).toLocaleString("en-AU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <button
              onClick={fetchCurrentVeecPrice}
              title="Reset to price stored in database"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition ml-auto"
            >
              <RefreshCw size={12} />
              Reset to DB price
            </button>
          </div>
        </div>

        {/* ── Activity ──────────────────────────────────────── */}
        <div className="mb-8">
          <label className="block font-semibold mb-2 text-gray-800">
            Activity
          </label>
          <select
            value={selectedActivity}
            onChange={(e) => handleActivityChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Select Activity</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── Scenario ──────────────────────────────────────── */}
        {selectedActivity && !hideScenario && (
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-gray-800">
              Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className={selectClass}
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

        {/* ── Brand + Model ─────────────────────────────────── */}
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
                  className={selectClass}
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
                  className={selectClass}
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

        {/* ── Job Info ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Date
            </label>
            <input
              type="date"
              value={jobDate}
              onChange={(e) => setJobDate(e.target.value)}
              className={selectClass}
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
              placeholder="e.g. 3064"
              className={selectClass}
            />
          </div>
        </div>

        {/* ── Buttons ───────────────────────────────────────── */}
        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Reset
          </button>
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-60"
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {/* ── Error ─────────────────────────────────────────── */}
        {calcError && (
          <div className="mt-8 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
            ⚠️ {calcError}
          </div>
        )}

        {/* ── Result ────────────────────────────────────────── */}
        {veuResult && (
          <ResultCard
            veuResult={veuResult}
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
