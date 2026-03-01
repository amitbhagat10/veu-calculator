"use client";

import { useEffect, useRef, useState } from "react";
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
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  /* ================= UI STATE ================= */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount] = useState(3);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ================= USER ================= */
  const [user, setUser] = useState<any>(null);

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

  /* ================= INIT ================= */
  useEffect(() => {
    fetchActivities();
    loadUser();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= DARK MODE ================= */
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  /* ================= SUPABASE ================= */
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

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

    const { data, error } = await supabase.rpc(
      "calculate_veu_rebate",
      {
        p_activity_id: selectedActivity,
        p_product_id: selectedProduct,
      }
    );

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

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#eef2f7] dark:bg-slate-900 transition-colors duration-500 flex">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`hidden md:flex flex-col ${
          collapsed ? "w-20" : "w-64"
        } bg-[#0C1E3B] text-white p-6 transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-10">
          {!collapsed && (
            <img src="/logo.png" className="w-20" />
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

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow px-6 py-4 flex justify-between items-center transition-colors duration-500">

          <div className="font-semibold text-lg">
            GP Solar | VEU Calculator
          </div>

          <div className="flex items-center gap-6">

            {/* NOTIFICATION */}
            <div className="relative" ref={notificationRef}>
              <div
                className="relative cursor-pointer"
                onClick={() =>
                  setNotificationOpen(!notificationOpen)
                }
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 text-sm"
                  >
                    No new notifications
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DARK MODE */}
            <motion.button
              whileTap={{ rotate: 180 }}
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun /> : <Moon />}
            </motion.button>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <img
                src={
                  user?.user_metadata?.avatar_url ||
                  "https://i.pravatar.cc/40"
                }
                className="w-9 h-9 rounded-full cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
              />

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 text-sm"
                  >
                    <div className="p-2">
                      {user?.email}
                    </div>
                    <div
                      onClick={logout}
                      className="p-2 flex items-center gap-2 text-red-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                    >
                      <LogOut size={16} />
                      Logout
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* ================= CALCULATOR ================= */}
        <main className="flex-1 p-6 md:p-14">

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto transition-colors">

            {/* Activity */}
            <div className="mb-8">
              <label className="block font-semibold mb-2">
                Activity
              </label>
              <select
                value={selectedActivity}
                onChange={(e) =>
                  handleActivityChange(e.target.value)
                }
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

            {/* Product */}
            <AnimatePresence>
              {selectedActivity && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-10"
                >
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

            {/* Date & Postcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <input
                type="date"
                value={jobDate}
                onChange={(e) =>
                  setJobDate(e.target.value)
                }
                className="border rounded-lg p-3"
              />
              <input
                type="text"
                maxLength={4}
                value={postcode}
                onChange={(e) =>
                  setPostcode(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Postcode"
                className="border rounded-lg p-3"
              />
            </div>

            {/* Buttons */}
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

            {/* Result */}
            <AnimatePresence>
              {rebateResult !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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
                        $
                        {Number(
                          rebateResult
                        ).toLocaleString()}
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
  );
}