"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  TrendingUp,
} from "lucide-react";

export interface VEUResult {
  veec_count: number;
  veecs?: number;
  website_veecs?: number;
  rebate_value: number;
  rebateValue?: number;
  calculated_rebate?: number;
  ghg_reduction?: number;
  heating_savings?: number;
  cooling_savings?: number;
  gsf_heat?: number;
  gsf_cool?: number;
  category?: string;
  climate_region?: string;
  metro_regional?: string;
  gems_zone?: string;
  hspf_upgrade?: number;
  tcspf_upgrade?: number;
  veec_price: number;
  btl_heat?: number;
  btl_cool?: number;
  formula_mode?: string;
  score_confidence?: string;
  override_applied?: boolean;
  postcode_group_override_applied?: boolean;
  calibration_applied?: boolean;
  original_formula_veecs?: string | number;
  original_formula_rebate_value?: string | number;
  matched_product_model_name?: string;
  matched_override_model_name?: string;
  website_source?: string;
  reviewer_notes?: string;
  error?: string;
  [key: string]: any;
}

const todayIso = new Date().toISOString().slice(0, 10);

export default function CalculatorForm({ onJobSaved }: { onJobSaved?: () => void }) {
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

  const [veecPrice, setVeecPrice] = useState<number>(83.6);
  const [veecPriceInput, setVeecPriceInput] = useState<string>("83.60");

  const [veuResult, setVeuResult] = useState<VEUResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
    fetchCurrentVeecPrice();
  }, []);

  const selectedActivityLabel = useMemo(
    () => activities.find((a) => a.id === selectedActivity)?.name || "",
    [activities, selectedActivity]
  );

  const selectedBrandLabel = useMemo(
    () => brands.find((b) => b.id === selectedBrand)?.name || "",
    [brands, selectedBrand]
  );

  const selectedProductLabel = useMemo(
    () => products.find((p) => p.id === selectedProduct)?.model_name || "",
    [products, selectedProduct]
  );

  const selectedScenarioLabel = useMemo(
    () => scenarios.find((s) => s.id === selectedScenario)?.name || "",
    [scenarios, selectedScenario]
  );

  const hideScenario =
    selectedActivityLabel === "Water Heating - New Install / No Decommissioning";

  const selectClass =
    "w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100";

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500";

  const fetchCurrentVeecPrice = async () => {
    const { data, error } = await supabase
      .from("veu_global_params")
      .select("param_value")
      .eq("param_name", "VEEC_PRICE")
      .maybeSingle();

    if (!error && data?.param_value) {
      const price = Number(data.param_value);
      if (!Number.isNaN(price) && price > 0) {
        setVeecPrice(price);
        setVeecPriceInput(price.toFixed(2));
      }
    }
  };

  const handleVeecPriceChange = (value: string) => {
    setVeecPriceInput(value);
    const parsed = Number.parseFloat(value);

    if (!Number.isNaN(parsed) && parsed > 0) {
      setVeecPrice(parsed);

      if (veuResult) {
        const recalculated = Math.round(veuResult.veec_count * parsed * 100) / 100;
        setVeuResult({
          ...veuResult,
          veec_price: parsed,
          rebate_value: recalculated,
          calculated_rebate: recalculated,
        });
      }
    }
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("name");

    if (error) {
      console.warn("Could not load activities", error);
      return;
    }

    setActivities(data || []);
  };

  const fetchScenarios = async (activityId: string) => {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("activity_id", activityId)
      .order("name");

    if (error) {
      console.warn("Could not load scenarios", error);
      setScenarios([]);
      return;
    }

    setScenarios(data || []);
  };

  const fetchBrands = async (activityId: string) => {
  let query = supabase
    .from("brands")
    .select("*")
    .eq("is_public_visible", true)
    .order("name");

  // Your existing database has activity_id on brands, so keep this filter.
  // If a future table does not have activity_id, this catch prevents the page from crashing.
  let { data, error } = await query.eq("activity_id", activityId);

  if (error) {
    const fallback = await supabase
      .from("brands")
      .select("*")
      .eq("is_public_visible", true)
      .order("name");

    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.warn("Could not load brands", error);
    setBrands([]);
    return;
  }

  setBrands(data || []);
};

const fetchProducts = async (brandId: string, scenarioId?: string) => {
  let query = supabase
    .from("products")
    .select("*")
    .eq("brand_id", brandId)
    .eq("is_public_visible", true)
    .order("model_name");

  if (scenarioId) {
    query = query.eq("scenario_id", scenarioId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("Could not load products", error);
    setProducts([]);
    return;
  }

  setProducts(data || []);
};

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
    setSaveSuccess(false);
    setSaveError(null);

    if (!value) return;

    await fetchBrands(value);

    const activityName = activities.find((a) => a.id === value)?.name || "";
    if (activityName !== "Water Heating - New Install / No Decommissioning") {
      await fetchScenarios(value);
    }
  };

  const handleScenarioChange = async (value: string) => {
    setSelectedScenario(value);
    setSelectedBrand("");
    setSelectedProduct("");
    setProducts([]);
    setVeuResult(null);
    setCalcError(null);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleBrandChange = async (value: string) => {
    setSelectedBrand(value);
    setSelectedProduct("");
    setProducts([]);
    setVeuResult(null);
    setCalcError(null);
    setSaveSuccess(false);
    setSaveError(null);

    if (!value) return;

    if (hideScenario) {
      await fetchProducts(value);
      return;
    }

    if (!selectedScenario) return;
    await fetchProducts(value, selectedScenario);
  };

  const handleCalculate = async () => {
    if (!selectedActivity || !selectedBrand || !selectedProduct || !postcode || !jobDate) {
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
    setSaveSuccess(false);
    setSaveError(null);

    const payload = {
      p_product_id: selectedProduct,
      p_postcode: Number(postcode),
      p_job_date: jobDate,
      p_activity_id: selectedActivity,
      p_scenario_id: selectedScenario || null,
      p_veec_price: Number(veecPrice || 83.6),
    };


    const { data, error } = await supabase.rpc(
      "calculate_rebate_veu_website",
      payload
    );


    setLoading(false);

    if (error) {
      setCalcError("Calculation error: " + error.message);
      return;
    }

    const dbResult = (Array.isArray(data) ? data[0] : data) as VEUResult;

    if (!dbResult) {
      setCalcError("No calculation result returned from database.");
      return;
    }

    if (dbResult?.error) {
      setCalcError(dbResult.error);
      return;
    }

    const finalVeecs = Number(
      dbResult?.veec_count ?? dbResult?.veecs ?? dbResult?.website_veecs ?? 0
    );

    const finalRebateValue = Number(
      dbResult?.rebate_value ?? finalVeecs * Number(veecPrice || 83.6)
    );

    const cleanedResult: VEUResult = {
      ...dbResult,
      veec_count: finalVeecs,
      veecs: finalVeecs,
      rebate_value: finalRebateValue,
      rebateValue: finalRebateValue,
      calculated_rebate: finalRebateValue,
      veec_price: Number(veecPrice || 83.6),
    };


    setVeuResult(cleanedResult);
  };

  const handleSaveJob = async () => {
    if (!veuResult || !customerName.trim() || !suburb.trim()) {
      setSaveError("Please enter customer name and suburb before saving.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setSaveError("You must be logged in to save a job.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("jobs").insert({
      user_id: userData.user.id,
      activity_id: selectedActivity,
      scenario_id: selectedScenario || null,
      product_id: selectedProduct,
      job_date: jobDate,
      postcode,
      customer_name: customerName.trim(),
      suburb: suburb.trim(),
      calculated_rebate: veuResult.rebate_value,
      rebate_value: veuResult.rebate_value,
      veec_count: veuResult.veec_count,
      veec_price: veuResult.veec_price,
      status: "Pending",
    });

    setSaving(false);

    if (error) {
      setSaveError("Failed to save job: " + error.message);
      return;
    }

    setSaveSuccess(true);
    setCustomerName("");
    setSuburb("");
    if (onJobSaved) onJobSaved();
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
    setCustomerName("");
    setSuburb("");
    setSaveSuccess(false);
    setSaveError(null);
  };

  const confidenceLabel = veuResult?.override_applied
    ? "Website validated score applied"
    : veuResult?.postcode_group_override_applied
      ? "Website score from same postcode group"
      : veuResult?.calibration_applied
        ? "Calibrated website estimate"
        : "Formula estimate";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Grant Calculator</h2>
        <p className="mt-1 text-sm text-gray-600">
          Calculate the available VEU rebate for selected products.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md md:p-10">
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <label className="font-semibold text-blue-900">
              VEEC Spot Price ($/certificate)
            </label>
          </div>

          <p className="mb-4 text-xs text-blue-600">
            Market price changes daily. Check at{" "}
            <a
              href="https://northmoregordon.com/certificate-prices/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-800"
            >
              Northmore Gordon
            </a>{" "}
            or{" "}
            <a
              href="https://www.ecovantage.com.au/victorian-energy-upgrades/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-800"
            >
              Ecovantage
            </a>
            . Current: ~$83.50–$84.00
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2">
              <span className="font-medium text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="200"
                value={veecPriceInput}
                onChange={(e) => handleVeecPriceChange(e.target.value)}
                className="w-24 bg-transparent text-lg font-bold text-gray-900 focus:outline-none"
              />
            </div>

            <span className="text-sm text-gray-500">per VEEC (excl. GST)</span>

            {veuResult && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2">
                <span className="mr-2 text-xs font-medium text-orange-600">
                  Live rebate:
                </span>
                <span className="font-bold text-orange-600">
                  $
                  {(veuResult.veec_count * veecPrice).toLocaleString("en-AU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <button
              onClick={fetchCurrentVeecPrice}
              className="ml-auto flex items-center gap-1 text-xs text-blue-600 transition hover:text-blue-800"
              type="button"
            >
              <RefreshCw size={12} /> Reset to DB price
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="mb-2 block font-semibold text-gray-800">Activity</label>
          <select
            value={selectedActivity}
            onChange={(e) => handleActivityChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Select Activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>

        {selectedActivity && !hideScenario && (
          <div className="mb-8">
            <label className="mb-2 block font-semibold text-gray-800">Scenario</label>
            <select
              value={selectedScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Scenario</option>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedActivity && (
          <div className="mb-10">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Product</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold text-gray-900">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  disabled={!hideScenario && !selectedScenario}
                  className={selectClass}
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-900">Model</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setVeuResult(null);
                    setCalcError(null);
                    setSaveSuccess(false);
                    setSaveError(null);
                  }}
                  disabled={!selectedBrand}
                  className={selectClass}
                >
                  <option value="">Select Model</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.model_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-gray-900">Date</label>
            <input
              type="date"
              value={jobDate}
              onChange={(e) => {
                setJobDate(e.target.value);
                setVeuResult(null);
                setCalcError(null);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-900">Postcode</label>
            <input
              type="text"
              maxLength={4}
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value.replace(/\D/g, ""));
                setVeuResult(null);
                setCalcError(null);
              }}
              placeholder="e.g. 3000"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="rounded-lg bg-gray-200 px-8 py-3 font-medium text-gray-800 transition hover:bg-gray-300"
            type="button"
          >
            Reset
          </button>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="rounded-lg bg-orange-500 px-8 py-3 font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
            type="button"
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {calcError && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{calcError}</span>
            </div>
          </div>
        )}

        {veuResult && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Estimated Rebate Summary
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedBrandLabel} {selectedProductLabel}
                    {!hideScenario && selectedScenarioLabel ? ` · ${selectedScenarioLabel}` : ""}
                  </p>
                </div>

                <div
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    veuResult.override_applied || veuResult.postcode_group_override_applied
                      ? "bg-emerald-100 text-emerald-700"
                      : veuResult.calibration_applied
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {confidenceLabel}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-white p-6">
                  <p className="text-sm font-medium text-blue-700">Estimated VEECs</p>
                  <p className="mt-2 text-5xl font-bold text-blue-700">
                    {Number(veuResult.veec_count || 0)}
                  </p>
                  {veuResult.original_formula_veecs && (
                    <p className="mt-2 text-xs text-gray-500">
                      Formula-only audit score: {veuResult.original_formula_veecs}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-6">
                  <p className="text-sm font-medium text-orange-700">Estimated rebate</p>
                  <p className="mt-2 text-5xl font-bold text-orange-600">
                    $
                    {Number(veuResult.rebate_value || 0).toLocaleString("en-AU", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Based on ${Number(veuResult.veec_price || veecPrice).toFixed(2)} per VEEC
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 text-sm text-gray-600 md:grid-cols-2">
                <div>
                  <span className="font-semibold text-gray-800">Formula mode:</span>{" "}
                  {veuResult.formula_mode || "N/A"}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Confidence:</span>{" "}
                  {veuResult.score_confidence || "N/A"}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Product model:</span>{" "}
                  {veuResult.matched_product_model_name || selectedProductLabel || "N/A"}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Matched override:</span>{" "}
                  {veuResult.matched_override_model_name || "N/A"}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Save This Job</h3>

              {saveSuccess ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 font-medium text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Job saved successfully! View it in the Jobs section.
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. John Smith"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Suburb <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        placeholder="e.g. Craigieburn"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {saveError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {saveError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Saves: {selectedBrandLabel} {selectedProductLabel} —{" "}
                      <span className="font-semibold text-blue-700">
                        {veuResult.veec_count} VEECs
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold text-orange-500">
                        ${Number(veuResult.rebate_value || 0).toLocaleString("en-AU")}
                      </span>
                    </div>

                    <button
                      onClick={handleSaveJob}
                      disabled={saving || !customerName.trim() || !suburb.trim()}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Job"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
