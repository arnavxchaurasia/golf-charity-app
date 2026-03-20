"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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

  /* ---------------- INIT ---------------- */

const init = async () => {
  setLoading(true);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ❗ ONLY redirect if DEFINITELY no session
  if (!session) {
    setLoading(false); // stop loading first
    window.location.href = "/auth/login";
    return;
  }

  const user = session.user;

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

  useEffect(() => {
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
      init();
    } catch {
      toast.error("Failed");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

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
        <p className="text-sm text-muted-foreground mt-1">
          Based on your performance
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

      {/* 🎯 MISSIONS */}
      <Card>
        <h2 className="text-xl font-semibold mb-6">
          Challenges 🎯
        </h2>

        <div className="space-y-5">

          {/* BEAT BEST */}
          <div>
            <p className="text-sm font-medium">
              🔥 Beat your best ({best})
            </p>
            <div className="h-2 bg-gray-200 rounded mt-2">
              <div
                className="h-2 bg-red-500 rounded"
                style={{ width: `${(avg / (best + 3)) * 100}%` }}
              />
            </div>
          </div>

          {/* CONSISTENCY */}
          <div>
            <p className="text-sm font-medium">
              🎯 Reach avg 30
            </p>
            <div className="h-2 bg-gray-200 rounded mt-2">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{ width: `${(avg / 30) * 100}%` }}
              />
            </div>
          </div>

        </div>
      </Card>

      {/* 🎖 BADGES */}
      <Card>
        <h2 className="text-xl font-semibold mb-6">
          Achievements 🎖
        </h2>

        <div className="flex gap-4 flex-wrap">

          {scores.length >= 1 && (
            <Badge label="First Score" />
          )}

          {scores.length >= 5 && (
            <Badge label="Consistent Player" />
          )}

          {best >= 30 && (
            <Badge label="High Performer" />
          )}

          {avg >= 25 && (
            <Badge label="Rising Star" />
          )}

        </div>
      </Card>

      {/* 🎯 SCORE INPUT */}
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

      {/* 📊 HISTORY */}
      <Card>
        <h2 className="text-xl font-semibold mb-6">
          Score History
        </h2>

        <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">

          {scores.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border rounded-xl"
            >
              <p className="text-sm text-muted-foreground">
                {new Date(s.played_at).toLocaleDateString()}
              </p>

              <p className="text-2xl font-bold">
                {s.score}
              </p>
            </motion.div>
          ))}

        </div>
      </Card>

      {/* SUBSCRIPTION */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">
          Membership
        </h2>

        <p>
          Status:{" "}
          <span className={isActive ? "text-green-500" : "text-red-500"}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </p>

        <button
          onClick={() => (window.location.href = "/subscribe")}
          className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-xl"
        >
          Manage Subscription
        </button>
      </Card>
    </div>
  );
}

/* ---------------- BADGE ---------------- */

function Badge({ label }: any) {
  return (
    <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full text-sm">
      {label}
    </div>
  );
}

/* ---------------- WRAPPER ---------------- */

export default function Dashboard() {
  return <DashboardContent />;
}