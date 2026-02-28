"use client";

import { useState } from "react";

export default function GrantCalculator() {
  const [postcode, setPostcode] = useState("");
  const [systemType, setSystemType] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleCheck = async () => {
    const res = await fetch("/api/check-eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode, systemType }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-96 text-black">
      <h2 className="text-xl font-bold mb-4 text-black">
        VEU Grant Calculator
      </h2>

      <input
        className="border p-2 w-full mb-3 text-black"
        placeholder="Enter Postcode"
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-3 text-black"
        value={systemType}
        onChange={(e) => setSystemType(e.target.value)}
      >
        <option value="">Select System</option>
        <option value="heat_pump">Heat Pump</option>
        <option value="electric">Electric</option>
      </select>

      <button
        onClick={handleCheck}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Check Eligibility
      </button>

      {result && (
        <div className="mt-4 text-black">
          <p>Eligible: {result.eligible ? "Yes" : "No"}</p>
          <p>Grant Amount: ${result.amount}</p>
        </div>
      )}
    </div>
  );
}
