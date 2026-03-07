"use client";

export default function DashboardWidgets() {
  const widgets = [
    { title: "Total Jobs", value: "124" },
    { title: "Approved Rebates", value: "$182,400" },
    { title: "Installers", value: "14" },
    { title: "Pending Jobs", value: "23" },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-10">
      {widgets.map((w, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-lg"
        >
          <p className="text-gray-400 text-sm">
            {w.title}
          </p>

          <h2 className="text-2xl font-semibold text-white mt-2">
            {w.value}
          </h2>
        </div>
      ))}
    </div>
  );
}