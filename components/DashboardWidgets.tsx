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
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition"
        >
          <p className="text-gray-600 text-sm font-medium">
            {w.title}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {w.value}
          </h2>
        </div>
      ))}
    </div>
  );
}