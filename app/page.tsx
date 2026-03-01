"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Calculator,
  Users,
  Briefcase,
} from "lucide-react";

export default function DashboardPage() {
  /* ================= UI STATE ================= */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  /* ================= DATA STATE ================= */
  const [activities, setActivities] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [postcode, setPostcode] = useState("");
  const [jobDate, setJobDate] = useState("");

  const [rebateResult, setRebateResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data } = await supabase.from("activities").select("*");
    if (data) setActivities(data);
  };

  const fetchBrands = async (activityId: string) => {
    const { data } = await supabase
      .from("brands")
      .select("*")
      .eq("activity_id", activityId);
    if (data) setBrands(data);
  };

  const fetchProducts = async (brandId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("brand_id", brandId);
    if (data) setProducts(data);
  };

  /* ================= HANDLERS ================= */
  const handleActivityChange = (value: string) => {
    setSelectedActivity(value);
    setSelectedBrand("");
    setSelectedProduct("");
    setBrands([]);
    setProducts([]);
    setRebateResult(null);
    fetchBrands(value);
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setSelectedProduct("");
    setProducts([]);
    setRebateResult(null);
    fetchProducts(value);
  };

  const handleCalculate = async () => {
    if (!selectedProduct || !postcode || !jobDate) {
      alert("Please complete all fields");
      return;
    }

    setLoading(true);
    setRebateResult(null);

    const { data, error } = await supabase.rpc("calculate_veu_rebate", {
      p_activity_id: selectedActivity,
      p_product_id: selectedProduct,
    });

    setLoading(false);

    if (error) {
      alert("Calculation error");
      return;
    }

    setRebateResult(data ?? 0);
  };

  const handleReset = () => {
    setSelectedActivity("");
    setSelectedBrand("");
    setSelectedProduct("");
    setPostcode("");
    setJobDate("");
    setBrands([]);
    setProducts([]);
    setRebateResult(null);
  };

  const selectedBrandLabel =
    brands.find((b) => b.id === selectedBrand)?.name || "";

  const selectedProductLabel =
    products.find((p) => p.id === selectedProduct)?.model_name || "";

  const selectedActivityLabel =
    activities.find((a) => a.id === selectedActivity)?.name || "";

  /* ================= UI ================= */
  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-[#eef2f7] dark:bg-slate-900 transition-colors">

        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside
          className={`hidden md:flex flex-col ${
            collapsed ? "w-20" : "w-64"
          } bg-[#0C1E3B] text-white p-6 transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-10">
            {!collapsed && (
              <img src="/logo.png" alt="Logo" className="w-20" />
            )}
            <button onClick={() => setCollapsed(!collapsed)}>
              <Menu size={18} />
            </button>
          </div>

          <nav className="space-y-3 text-sm">
            <div className="bg-white/10 p-3 rounded-lg flex items-center gap-2">
              <Calculator size={16} />
              {!collapsed && "Calculator"}
            </div>
            <div className="hover:bg-white/10 p-3 rounded-lg flex items-center gap-2 cursor-pointer">
              <Users size={16} />
              {!collapsed && "Users"}
            </div>
            <div className="hover:bg-white/10 p-3 rounded-lg flex items-center gap-2 cursor-pointer">
              <Briefcase size={16} />
              {!collapsed && "Jobs"}
            </div>
          </nav>
        </aside>

        {/* ================= MOBILE SIDEBAR ================= */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className="fixed top-0 left-0 w-64 h-full bg-[#0C1E3B] text-white p-6 z-50 md:hidden"
              >
                <div className="flex justify-between mb-6">
                  <img src="/logo.png" className="w-20" />
                  <X onClick={() => setSidebarOpen(false)} />
                </div>
                <div className="space-y-4">
                  <div>Calculator</div>
                  <div>Users</div>
                  <div>Jobs</div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ================= MAIN ================= */}
        <div className="flex-1 flex flex-col">

          {/* Sticky Header */}
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow px-6 py-4 flex justify-between items-center">
            <Menu
              className="md:hidden cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            />

            <div className="font-semibold text-lg">
              GP Solar | VEU Calculator
            </div>

            <div className="flex items-center gap-4">
              <Bell size={18} className="cursor-pointer" />
              <button onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <img
                src="https://i.pravatar.cc/40"
                className="w-8 h-8 rounded-full"
              />
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6 md:p-14">

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto">

              {/* Activity */}
              <div className="mb-8">
                <label className="block font-semibold mb-2">
                  Activity
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => handleActivityChange(e.target.value)}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">Select Activity</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRODUCT SECTION */}
              <AnimatePresence>
                {selectedActivity && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-10"
                  >
                    <h2 className="text-lg font-semibold mb-6">
                      Product
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <select
                        value={selectedBrand}
                        onChange={(e) =>
                          handleBrandChange(e.target.value)
                        }
                        className="border rounded-lg p-3"
                      >
                        <option value="">Select Brand</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedProduct}
                        onChange={(e) =>
                          setSelectedProduct(e.target.value)
                        }
                        className="border rounded-lg p-3"
                      >
                        <option value="">Select Model</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.model_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DATE + POSTCODE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <input
                  type="date"
                  value={jobDate}
                  onChange={(e) => setJobDate(e.target.value)}
                  className="border rounded-lg p-3"
                />
                <input
                  type="text"
                  maxLength={4}
                  value={postcode}
                  onChange={(e) =>
                    setPostcode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Postcode"
                  className="border rounded-lg p-3"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={handleCalculate}
                  className="bg-indigo-700 text-white px-6 py-3 rounded-lg"
                >
                  {loading ? "Calculating..." : "Calculate"}
                </button>
              </div>

              {/* RESULT */}
              <AnimatePresence>
                {rebateResult !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-12 p-8 bg-white dark:bg-slate-700 rounded-2xl shadow-xl"
                  >
                    {rebateResult > 0 ? (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <CheckCircle className="text-green-600" />
                          <h3 className="text-xl font-semibold">
                            Scenario Result
                          </h3>
                        </div>

                        <div className="text-3xl font-bold text-green-600">
                          ${Number(rebateResult).toLocaleString()}
                        </div>

                        <div className="text-sm mt-2 text-gray-500">
                          + GST
                        </div>
                      </>
                    ) : (
                      <div className="text-red-600 font-semibold">
                        Not Eligible
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}