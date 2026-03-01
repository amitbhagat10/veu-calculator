"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Sun, Moon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  /* ================= STATE ================= */
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [user, setUser] = useState<any>(null);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    loadUser();

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
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

  /* ================= DARK MODE TOGGLE ================= */
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  /* ================= INITIALS LOGIC ================= */
  const getInitials = () => {
    if (!user) return "?";

    // 1️⃣ Try metadata name
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name;

    if (fullName && fullName.trim().length > 0) {
      const parts = fullName.trim().split(" ");

      if (parts.length >= 2) {
        return (
          parts[0][0] + parts[1][0]
        ).toUpperCase();
      }

      return fullName.substring(0, 2).toUpperCase();
    }

    // 2️⃣ Fallback to email
    if (user.email) {
      const emailName = user.email.split("@")[0];
      return emailName.substring(0, 2).toUpperCase();
    }

    // 3️⃣ Final fallback
    return "U";
  };

  /* ================= UI ================= */
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow px-6 py-4 flex justify-between items-center transition-colors duration-500">

      {/* TITLE */}
      <div className="font-semibold text-lg text-gray-800 dark:text-white">
        GP Solar | VEU Calculator
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-6">

        {/* ================= NOTIFICATIONS ================= */}
        <div className="relative" ref={notificationRef}>
          <div
            className="relative cursor-pointer text-gray-700 dark:text-white"
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
                className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 text-sm text-gray-700 dark:text-gray-200"
              >
                No new notifications
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= DARK MODE ================= */}
        <motion.button
          whileTap={{ rotate: 180 }}
          onClick={toggleDarkMode}
          className="text-gray-700 dark:text-white"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* ================= PROFILE ================= */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="cursor-pointer"
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-slate-600"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {getInitials()}
              </div>
            )}
          </div>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-2 text-sm"
              >
                <div className="p-2 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-slate-700">
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