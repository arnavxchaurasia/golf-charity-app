"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // ✅ ALWAYS force reload after login
    const redirectTo =
      searchParams.get("redirect") || "/dashboard";

    window.location.href = redirectTo;
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1600&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover"
          alt="golf"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/20" />

        <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-semibold leading-tight">
            Welcome back.
          </h2>
          <p className="mt-3 text-white/80 max-w-sm">
            Continue your journey of playing, winning,
            and making a real impact.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-border bg-white/80 backdrop-blur-xl p-8 shadow-xl">
            <h1 className="text-3xl font-semibold">Login</h1>
            <p className="text-muted-foreground mt-2">
              Access your account
            </p>

            <div className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              Don’t have an account?{" "}
              <span
                onClick={() => router.push("/auth/signup")}
                className="text-blue-600 cursor-pointer font-medium"
              >
                Sign up
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}