"use client";

import { motion } from "framer-motion";

type Job = {
  id: string;
  customerName: string;
  suburb: string;
  rebate: number;
  status: "Pending" | "Approved" | "Rejected";
};

export default function JobCards() {

  // Temporary sample jobs
  const jobs: Job[] = [
    {
      id: "1",
      customerName: "John Smith",
      suburb: "Craigieburn",
      rebate: 1500,
      status: "Pending",
    },
    {
      id: "2",
      customerName: "Sarah Lee",
      suburb: "Reservoir",
      rebate: 1200,
      status: "Approved",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

      {jobs.map((job) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="
            bg-white
            border border-gray-200
            rounded-xl
            shadow-sm
            p-6
            flex
            justify-between
            items-start
            hover:shadow-md
            transition
          "
        >

          {/* LEFT SIDE */}
          <div>

            <h3 className="text-lg font-semibold text-gray-900">
              {job.customerName}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {job.suburb}
            </p>

            <p className="text-orange-500 font-bold text-xl mt-4">
              ${job.rebate.toLocaleString()}
            </p>

          </div>

          {/* STATUS BADGE */}
          <div>

            {job.status === "Approved" && (
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-lg font-medium">
                Approved
              </span>
            )}

            {job.status === "Pending" && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-lg font-medium">
                Pending
              </span>
            )}

            {job.status === "Rejected" && (
              <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-lg font-medium">
                Rejected
              </span>
            )}

          </div>

        </motion.div>
      ))}

    </div>
  );
}