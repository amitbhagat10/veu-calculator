"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Sun, Moon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [user, setUser] = useState<any>(null);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
    }
  }, []);

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
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

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

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const getInitials = () => {
    if (!user) return "?";

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name;

    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (
          parts[0][0] + parts[1][0]
        ).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  return (
    <header
  className="
  sticky top-4
  z-30
  mx-6
  h-16
  flex items-center justify-between
  px-10
  rounded-xl
  bg-white
  border border-gray-200
  shadow-md
  text-gray-900
"
>
      <div className="font-semibold text-lg text-blue-700">
        GP HVAC | VEU Calculator
      </div>

     <div className="flex items-center gap-6 text-gray-700">
        {/* NOTIFICATIONS */}

        <div className="relative" ref={notificationRef}>
          <div
            className="relative cursor-pointer"
            onClick={() =>
              setNotificationOpen(!notificationOpen)
            }
          >
            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </div>

          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 text-sm text-gray-700 dark:text-gray-200"
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
          {darkMode ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </motion.button>

        {/* PROFILE */}

        <div className="relative" ref={profileRef}>
          <div
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
            className="cursor-pointer"
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={
                  user.user_metadata.avatar_url
                }
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-sm">
                {getInitials()}
              </div>
            )}
          </div>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-lg p-2 text-sm"
              >
                <div className="p-2 border-b border-gray-200 dark:border-slate-700">
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