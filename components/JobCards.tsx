"use client";

export default function JobCards() {
  const jobs = [
    {
      customer: "John Smith",
      suburb: "Craigieburn",
      rebate: "$1,500",
      status: "Pending",
    },
    {
      customer: "Sarah Lee",
      suburb: "Reservoir",
      rebate: "$1,200",
      status: "Approved",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {jobs.map((job, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-lg"
        >
          <div className="flex justify-between">
            <div>
              <h3 className="text-white font-semibold">
                {job.customer}
              </h3>

              <p className="text-gray-400 text-sm">
                {job.suburb}
              </p>
            </div>

            <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400">
              {job.status}
            </span>
          </div>

          <div className="mt-6 text-xl text-orange-400 font-semibold">
            {job.rebate}
          </div>
        </div>
      ))}
    </div>
  );
}