"use client";

import { CheckCircle, ChevronDown, ChevronUp, Zap, Thermometer, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { VEUResult } from "@/components/CalculatorForm";

interface Props {
  veuResult: VEUResult;
  brand: string;
  model: string;
  activity: string;
  scenario?: string;
}

export default function ResultCard({ veuResult, brand, model, activity, scenario }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (veuResult.veec_count <= 0) {
    return (
      <div className="mt-12 bg-red-50 border border-red-200 text-red-600 font-semibold p-6 rounded-xl">
        Not Eligible for Rebate
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 bg-white border border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md transition"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="text-green-600" size={22} />
        <h3 className="text-lg font-semibold text-gray-900">Eligible – Scenario Result</h3>
      </div>

      {/* Product Info */}
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-900">{brand} {model}</h4>
        <p className="text-gray-500 text-sm mt-1">{activity}</p>
        {scenario && <p className="text-gray-500 text-sm mt-1">{scenario}</p>}
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            Category {veuResult.category}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
            {veuResult.metro_regional} Victoria – {veuResult.climate_region}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
            GEMS {veuResult.gems_zone} Zone
          </span>
        </div>
      </div>

      {/* Main Results */}
      <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VEECs */}
        <div className="bg-blue-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">VEECs Created</span>
          </div>
          <div className="text-4xl font-bold text-blue-700">
            {veuResult.veec_count.toLocaleString()}
          </div>
          <div className="text-xs text-blue-500 mt-1">
            Victorian Energy Efficiency Certificates
          </div>
        </div>

        {/* Rebate Value */}
        <div className="bg-orange-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-orange-700">Government Rebate</span>
          </div>
          <div className="text-4xl font-bold text-orange-500">
            ${veuResult.rebate_value.toLocaleString()}
          </div>
          <div className="text-xs text-orange-400 mt-1">
            + GST &nbsp;·&nbsp; @ ${veuResult.veec_price}/VEEC
          </div>
        </div>
      </div>

      {/* GHG Reduction */}
      <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-green-700 font-medium">
          GHG Equivalent Reduction
        </span>
        <span className="text-lg font-bold text-green-700">
          {veuResult.ghg_reduction.toFixed(3)} t CO₂-e
        </span>
      </div>

      {/* Breakdown Toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="mt-6 w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 transition"
      >
        <span className="font-medium">View Calculation Breakdown</span>
        {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">

              {/* Heating */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={14} className="text-red-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Heating (Eq. 6.2)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Row label="GSFheat" value={veuResult.gsf_heat.toFixed(4)} />
                  <Row label="BTLheat" value={`${veuResult.btl_heat} MWh/kW`} />
                  <Row label="HSPF (upgrade)" value={veuResult.hspf_upgrade.toFixed(3)} />
                  <Row label="Heating Savings" value={`${veuResult.heating_savings.toFixed(4)} t CO₂-e/kW`} />
                </div>
              </div>

              {/* Cooling */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wind size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Cooling (Eq. 6.4)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Row label="GSFcool" value={veuResult.gsf_cool.toFixed(4)} />
                  <Row label="BTLcool" value={`${veuResult.btl_cool} MWh/kW`} />
                  <Row label="TCSPF (upgrade)" value={veuResult.tcspf_upgrade.toFixed(3)} />
                  <Row label="Cooling Savings" value={`${veuResult.cooling_savings.toFixed(4)} t CO₂-e/kW`} />
                </div>
              </div>

              {/* Formula Summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-600 mb-2">Formula Reference – VEU Specs 2018 v21.0, Part 6</p>
                <p>GHG Eq. Reduction = (Heating Savings + Cooling Savings) × 12 years</p>
                <p>VEECs = FLOOR(GHG Eq. Reduction)</p>
                <p>Rebate = VEECs × ${veuResult.veec_price}/VEEC</p>
                <p className="mt-2">Scenario (vii): Replacing ducted gas heater with reverse-cycle AC</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </>
  );
}
