"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [user, setUser] = useState<any>(null);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ================= INIT THEME ================= */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }

    loadUser();
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

  /* ================= DARK MODE TOGGLE ================= */
  const toggleDarkMode = () => {
    const newMode = !darkMode;

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setDarkMode(newMode);
  };

  /* ================= USER ================= */
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow px-6 py-4 flex justify-between items-center transition-colors duration-500">

      <div className="font-semibold text-lg">
        GP Solar | VEU Calculator
      </div>

      <div className="flex items-center gap-6">

        {/* 🔔 NOTIFICATIONS */}
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
                className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-xl rounded-lg p-4 text-sm z-50"
              >
                <div className="font-semibold mb-2">
                  Notifications
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  No new notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🌙 DARK MODE */}
        <motion.button
          whileTap={{ rotate: 180 }}
          onClick={toggleDarkMode}
          className="cursor-pointer"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* 👤 PROFILE */}
        <div className="relative" ref={profileRef}>
          <img
            src={
              user?.user_metadata?.avatar_url ||
              "https://i.pravatar.cc/40"
            }
            className="w-9 h-9 rounded-full cursor-pointer"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
          />

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg p-2 text-sm"
              >
                <div className="p-2 text-gray-700 dark:text-gray-300">
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
  );
}