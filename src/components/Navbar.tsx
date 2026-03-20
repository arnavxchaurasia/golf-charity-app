"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { useTheme } from "next-themes";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  // Fix hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // 🔐 TEMP ADMIN CHECK (replace later with DB role)
  const isAdmin = user?.email === "your@email.com";

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border backdrop-blur-xl bg-white/70 dark:bg-black/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BirdieFund
          </span>
        </Link>

        {/* CENTER LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition">
            Dashboard
          </Link>
          <Link href="/leaderboard" className="hover:text-foreground transition">
            Leaderboard
          </Link>
          <Link href="/charities" className="hover:text-foreground transition">
            Charities
          </Link>

          {/* 🔐 Admin only */}
          {user && isAdmin && (
            <Link href="/admin" className="hover:text-foreground transition">
              Admin
            </Link>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* THEME TOGGLE
          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button> */}

          {!user ? (
            <>
              {/* LOGIN */}
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl text-sm border border-border hover:bg-muted transition"
              >
                Login
              </Link>

              {/* SIGNUP */}
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:opacity-90 transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">

              {/* USER BUTTON */}
              <button
                onClick={() => setOpen(!open)}
                className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center font-medium"
              >
                {user.email?.[0]?.toUpperCase()}
              </button>

              {/* DROPDOWN */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 rounded-2xl border border-border bg-white dark:bg-black shadow-xl overflow-hidden"
                  >

                    {/* USER INFO */}
                    <div className="px-4 py-3 border-b border-border text-xs text-muted-foreground">
                      {user.email}
                    </div>

                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 hover:bg-muted transition"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/leaderboard"
                      className="block px-4 py-2 hover:bg-muted transition"
                    >
                      Leaderboard
                    </Link>

                    <Link
                      href="/charities"
                      className="block px-4 py-2 hover:bg-muted transition"
                    >
                      Charities
                    </Link>

                    {/* 🔐 Admin only */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 hover:bg-muted transition"
                      >
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}