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
      <div className="mt-12 text-red-600 font-semibold">
        Not Eligible for Rebate
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 relative bg-white dark:bg-slate-700 rounded-2xl shadow-xl border p-8 transition-colors"
    >
      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-green-500 to-emerald-600 rounded-l-2xl"></div>

      <div className="ml-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="text-green-600" />
          <h3 className="text-xl font-semibold dark:text-white">
            Scenario Result
          </h3>
        </div>

        <h4 className="text-lg font-bold dark:text-white">
          {brand} {model}
        </h4>

        <p className="text-sm text-gray-500 dark:text-gray-300">
          {activity}
        </p>

        <div className="border-t pt-6 mt-6">
          <div className="flex justify-between">
            <span>Government Rebate</span>
            <span className="text-3xl font-bold text-green-600">
              ${rebateResult.toLocaleString()}
            </span>
          </div>

          <div className="text-sm text-gray-500 mt-2">
            + GST
          </div>
        </div>
      </div>
    </motion.div>
  );
}