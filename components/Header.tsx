"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }

    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const toggleDarkMode = () => {
    const isDark =
      document.documentElement.classList.contains("dark");

    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
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

        <Bell
          size={20}
          className="cursor-pointer"
          onClick={() => setNotificationOpen(!notificationOpen)}
        />

        <motion.button
          whileTap={{ rotate: 180 }}
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun /> : <Moon />}
        </motion.button>

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
                <div className="p-2">{user?.email}</div>
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