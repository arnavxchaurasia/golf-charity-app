"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function Admin() {
  const { toast } = useToast();

  const [winners, setWinners] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);

  // =========================
  // 📊 ANALYTICS
  // =========================
  const fetchAnalytics = async () => {
    try {
      const [rev, don, pay, active] = await Promise.all([
        supabase.from("total_revenue").select("*").single(),
        supabase.from("total_donations").select("*").single(),
        supabase.from("total_payouts").select("*").single(),
        supabase.from("active_users").select("*").single(),
      ]);

      setAnalytics({
        revenue: rev.data?.revenue || 0,
        donations: don.data?.donations || 0,
        payouts: pay.data?.payouts || 0,
        activeUsers: active.data?.active || 0,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    }
  };

  // =========================
  // 🔮 SIMULATION
  // =========================
  const simulateDraw = async () => {
    setSimLoading(true);

    try {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "active")
        .gt("end_date", new Date().toISOString());

      const userIds = subs?.map((s) => s.user_id) || [];

      if (!userIds.length) {
        return toast({
          title: "No Users",
          description: "No active users found",
          variant: "destructive",
        });
      }

      const drawNumbers = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 45) + 1
      );

      setSimulation({
        drawNumbers,
        totalUsers: userIds.length,
      });
    } catch {
      toast({
        title: "Error",
        description: "Simulation failed",
        variant: "destructive",
      });
    } finally {
      setSimLoading(false);
    }
  };

  // =========================
  // 🎯 RUN DRAW (API)
  // =========================
  const runDraw = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/run-draw", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setStats(data);

      toast({
        title: "Success",
        description: "Draw completed successfully",
      });

      fetchWinners();
      fetchAnalytics();
    } catch {
      toast({
        title: "Error",
        description: "Draw failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔧 WINNER ACTION API
  // =========================
  const handleWinnerAction = async (
    id: string,
    action: "approve" | "paid"
  ) => {
    try {
      const res = await fetch("/api/winner-action", {
        method: "POST",
        body: JSON.stringify({ id, action }),
      });

      if (!res.ok) throw new Error();

      toast({
        title: "Updated",
        description: `Winner ${action}`,
      });

      fetchWinners();
    } catch {
      toast({
        title: "Error",
        description: "Action failed",
        variant: "destructive",
      });
    }
  };

  // =========================
  // 📦 DATA
  // =========================
  const fetchWinners = async () => {
    const { data } = await supabase
      .from("winners")
      .select("*")
      .order("created_at", { ascending: false });

    setWinners(data || []);
  };

  useEffect(() => {
    fetchWinners();
    fetchAnalytics();
  }, []);

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6 font-bold">Admin Panel</h1>

      {/* ANALYTICS */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Revenue" value={analytics.revenue} />
          <Stat label="Donations" value={analytics.donations} />
          <Stat label="Payouts" value={analytics.payouts} />
          <Stat label="Users" value={analytics.activeUsers} />
        </div>
      )}

      {/* ACTIONS */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={simulateDraw}
          disabled={simLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          {simLoading ? "Simulating..." : "Simulate"}
        </button>

        <button
          onClick={runDraw}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded"
        >
          {loading ? "Running..." : "Run Draw"}
        </button>
      </div>

      {/* WINNERS */}
      {winners.map((w) => (
        <div key={w.id} className="border p-4 mb-3 rounded-xl">
          <p>Match: {w.match_count}</p>
          <p>Payout: ₹{w.payout}</p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleWinnerAction(w.id, "approve")}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Approve
            </button>

            <button
              onClick={() => handleWinnerAction(w.id, "paid")}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Paid
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🔥 small reusable component
function Stat({ label, value }: any) {
  return (
    <div className="p-4 border rounded-xl">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">₹{value}</p>
    </div>
  );
}