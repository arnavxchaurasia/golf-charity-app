"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  // 🔥 Fix hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!mounted) return null; // 🔥 prevents mismatch

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
      
      <a href="/" className="text-lg font-semibold">
        Golf Charity
      </a>

      <div className="flex items-center gap-4">

        {/* 🔥 Theme Toggle */}
        <button
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

          <a href="/leaderboard">Leaderboard</a>

        {!user ? (
          <>
            <a href="/auth/login">Login</a>
            <a
              href="/auth/signup"
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Sign Up
            </a>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center"
            >
              👤
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                <a
                  href="/dashboard"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Dashboard
                </a>

                <a
                  href="/subscribe"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Subscription
                </a>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}