"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  rebateResult: number;
  brand: string;
  model: string;
  activity: string;
}

export default function ResultCard({
  rebateResult,
  brand,
  model,
  activity,
}: Props) {

  if (rebateResult <= 0) {
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
      className="
      mt-12
      bg-white
      border border-gray-200
      rounded-xl
      shadow-sm
      p-8
      transition
      hover:shadow-md
      "
    >

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">

        <CheckCircle className="text-green-600" size={22} />

        <h3 className="text-lg font-semibold text-gray-900">
          Scenario Result
        </h3>

      </div>

      {/* PRODUCT */}
      <div className="mb-6">

        <h4 className="text-xl font-bold text-gray-900">
          {brand} {model}
        </h4>

        <p className="text-gray-500 text-sm mt-1">
          {activity}
        </p>

      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-200 pt-6">

        <div className="flex items-center justify-between">

          <span className="text-gray-600 font-medium">
            Government Rebate
          </span>

          <span className="text-3xl font-bold text-orange-500">
            ${rebateResult.toLocaleString()}
          </span>

        </div>

        <div className="text-sm text-gray-400 mt-1">
          + GST
        </div>

      </div>

    </motion.div>
  );
}