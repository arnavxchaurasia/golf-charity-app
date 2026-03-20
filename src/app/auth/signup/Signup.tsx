"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* ================= SIGNUP ================= */
  const handleSignup = async () => {
    if (loading) return;

    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    // ✅ create profile
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
      });
    }

    // ✅ redirect AFTER signup only
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover"
          alt="golf"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/20" />

        <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-semibold leading-tight">
            Start your journey.
          </h2>
          <p className="mt-3 text-white/80 max-w-sm">
            Turn every round into impact, rewards, and something bigger than the game.
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
            <h1 className="text-3xl font-semibold">
              Create account
            </h1>
            <p className="text-muted-foreground mt-2">
              Join the platform in seconds
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

              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/auth/login")}
                className="text-blue-600 cursor-pointer font-medium"
              >
                Login
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}