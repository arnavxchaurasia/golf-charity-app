"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { toast } from "sonner";
import { motion } from "framer-motion";

/* ---------------- UI ---------------- */

function Card({ children }: any) {
  return (
    <div className="rounded-3xl border border-border bg-white/80 backdrop-blur p-6 shadow-xl hover:shadow-2xl transition">
      {children}
    </div>
  );
}

/* ---------------- RANK SYSTEM ---------------- */

function getRank(avg: number) {
  if (avg < 15) return { name: "Bronze", color: "text-amber-600" };
  if (avg < 25) return { name: "Silver", color: "text-gray-500" };
  if (avg < 35) return { name: "Gold", color: "text-yellow-500" };
  return { name: "Elite", color: "text-purple-600" };
}

/* ---------------- MAIN ---------------- */

function DashboardContent() {
  const [scores, setScores] = useState<any[]>([]);
  const [score, setScore] = useState(20);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // ✅ FINAL FIX: use getUser instead of getSession
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      setUser(user);

      const [subRes, scoreRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("scores")
          .select("*")
          .eq("user_id", user.id)
          .order("played_at", { ascending: false }),
      ]);

      setSubscription(subRes.data);
      setScores(scoreRes.data || []);
      setLoading(false);
    };

    init();
  }, []);

  const isActive =
    subscription?.status === "active" &&
    new Date(subscription?.end_date) > new Date();

  /* ---------------- LOGIC ---------------- */

  const avg =
    scores.length > 0
      ? Math.round(
          scores.reduce((a, b) => a + b.score, 0) / scores.length
        )
      : 0;

  const best =
    scores.length > 0
      ? Math.max(...scores.map((s) => s.score))
      : 0;

  const rank = getRank(avg);
  const streak = scores.length >= 3 ? "🔥 Active" : "—";

  /* ---------------- ADD SCORE ---------------- */

  const addScore = async () => {
    if (!isActive) return toast.error("Subscription required");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch("/api/add-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ score }),
      });

      toast.success("Score saved 🎯");

      // refresh data
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user?.id)
        .order("played_at", { ascending: false });

      setScores(data || []);
    } catch {
      toast.error("Failed");
    }
  };

  if (loading)
    return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="section space-y-12">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-semibold">Your Game</h1>
        <p className="text-muted-foreground">
          Improve. Compete. Give back.
        </p>
      </div>

      {/* RANK */}
      <Card>
        <h2 className="text-lg mb-2">Your Rank</h2>
        <p className={`text-3xl font-bold ${rank.color}`}>
          {rank.name}
        </p>
      </Card>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-5">
        <Card>
          <p className="text-sm text-muted-foreground">Avg Score</p>
          <p className="text-2xl font-bold">{avg}</p>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Best Score</p>
          <p className="text-2xl font-bold">{best}</p>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold">{streak}</p>
        </Card>
      </div>

      {/* SCORE INPUT */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">
          Enter Score
        </h2>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setScore((s) => Math.max(1, s - 1))}
            className="w-12 h-12 rounded-full bg-gray-200"
          >
            −
          </button>

          <motion.div
            key={score}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold"
          >
            {score}
          </motion.div>

          <button
            onClick={() => setScore((s) => Math.min(45, s + 1))}
            className="w-12 h-12 rounded-full bg-gray-200"
          >
            +
          </button>

          <button
            onClick={addScore}
            className="ml-6 px-6 py-2 bg-black text-white rounded-xl"
          >
            Save
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- WRAPPER ---------------- */

export default function Dashboard() {
  return <DashboardContent />;
}