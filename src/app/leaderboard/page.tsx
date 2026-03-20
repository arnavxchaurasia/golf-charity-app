"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Leaderboard() {
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      // 🏆 TOP WINNERS
      const { data: winners } = await supabase
        .from("winners")
        .select("user_id, payout")
        .order("payout", { ascending: false });

      const winnerMap: Record<string, number> = {};

      for (const w of winners || []) {
        winnerMap[w.user_id] =
          (winnerMap[w.user_id] || 0) + (w.payout || 0);
      }

      const winnerArray = Object.entries(winnerMap)
        .map(([user_id, total]) => ({ user_id, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      // 💖 TOP DONORS
      const { data: donations } = await supabase
        .from("donations")
        .select("user_id, amount");

      const donationMap: Record<string, number> = {};

      for (const d of donations || []) {
        donationMap[d.user_id] =
          (donationMap[d.user_id] || 0) + (d.amount || 0);
      }

      const donorArray = Object.entries(donationMap)
        .map(([user_id, total]) => ({ user_id, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setTopWinners(winnerArray);
      setTopDonors(donorArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center">
        Leaderboard
      </h1>

      {/* 🏆 Winners */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Top Winners
        </h2>

        {topWinners.map((w, index) => (
          <div
            key={w.user_id}
            className="flex justify-between border p-3 mb-2 rounded"
          >
            <p>
              #{index + 1} — {w.user_id.slice(0, 6)}...
            </p>
            <p className="font-bold">₹{w.total.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* 💖 Donors */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Top Donors
        </h2>

        {topDonors.map((d, index) => (
          <div
            key={d.user_id}
            className="flex justify-between border p-3 mb-2 rounded"
          >
            <p>
              #{index + 1} — {d.user_id.slice(0, 6)}...
            </p>
            <p className="font-bold">₹{d.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}