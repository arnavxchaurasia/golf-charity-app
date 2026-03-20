"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState("");

  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [percentage, setPercentage] = useState(10);

  const [winners, setWinners] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [drawHistory, setDrawHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  // =========================
  // 🔥 INIT
  // =========================
  const init = async () => {
    setLoading(true);

    const user = await getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .lt("end_date", new Date().toISOString());

    const [
      subRes,
      scoreRes,
      charityRes,
      winnerRes,
      donationRes,
      drawRes,
    ] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),

      supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false }),

      supabase.from("charities").select("*"),

      supabase
        .from("winners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("donations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("draws")
        .select(`
          id,
          numbers,
          draw_month,
          winners (
            user_id,
            payout,
            match_count
          )
        `)
        .order("created_at", { ascending: false }),
    ]);

    setSubscription(subRes.data);
    setScores(scoreRes.data || []);
    setCharities(charityRes.data || []);
    setWinners(winnerRes.data || []);
    setDonations(donationRes.data || []);

    // 🔥 Process draw history
    const formatted =
      drawRes.data?.map((draw: any) => {
        const userWin = draw.winners.find(
          (w: any) => w.user_id === user.id
        );

        return {
          ...draw,
          userWin,
        };
      }) || [];

    setDrawHistory(formatted);

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  // =========================
  // 🔹 ACTIVE CHECK
  // =========================
  const isActive =
    subscription?.status === "active" &&
    new Date(subscription?.end_date) > new Date();

  // =========================
  // 🔹 ADD SCORE
  // =========================
  const addScore = async () => {
    if (!isActive) return alert("Active subscription required");

    const scoreValue = parseInt(newScore);

    if (!scoreValue || scoreValue < 1 || scoreValue > 45) {
      return alert("Score must be between 1–45");
    }

    const user = await getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_at", { ascending: true });

    if (existing && existing.length >= 5) {
      await supabase
        .from("scores")
        .delete()
        .eq("id", existing[0].id);
    }

    await supabase.from("scores").insert({
      user_id: user.id,
      score: scoreValue,
      played_at: new Date().toISOString(),
    });

    setNewScore("");
    init();
  };

  // =========================
  // 🔹 SAVE CHARITY
  // =========================
  const saveCharity = async () => {
    const user = await getUser();
    if (!user) return;

    if (!selectedCharity || percentage < 10) {
      return alert("Select charity & minimum 10%");
    }

    await supabase
      .from("profiles")
      .update({
        charity_id: selectedCharity,
        charity_percentage: percentage,
      })
      .eq("id", user.id);

    alert("Charity updated!");
  };

  // =========================
  // 🔹 UPLOAD PROOF
  // =========================
  const uploadProof = async (file: File, winnerId: string) => {
    if (!file) return;

    const path = `proof-${winnerId}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("proofs")
      .upload(path, file);

    if (error) return alert("Upload failed");

    const { data } = supabase.storage
      .from("proofs")
      .getPublicUrl(path);

    await supabase
      .from("winners")
      .update({ proof_url: data.publicUrl })
      .eq("id", winnerId);

    init();
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Subscription */}
      <div className="border p-5 rounded-xl">
        <p>
          Status:{" "}
          <span className={isActive ? "text-green-500" : "text-red-500"}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </p>

        <p>Plan: {subscription?.plan || "N/A"}</p>

        <p>
          Expires:{" "}
          {subscription?.end_date
            ? new Date(subscription.end_date).toLocaleDateString()
            : "N/A"}
        </p>

        {!isActive && (
          <a
            href="/subscribe"
            className="inline-block mt-3 bg-green-600 px-4 py-2 rounded text-white"
          >
            Subscribe
          </a>
        )}
      </div>

      {/* Add Score */}
      <div>
        <h2 className="text-xl mb-2">Add Score</h2>

        <input
          type="number"
          value={newScore}
          onChange={(e) => setNewScore(e.target.value)}
          className="border p-2 mr-2"
        />

        <button
          onClick={addScore}
          disabled={!isActive}
          className={`px-4 py-2 text-white ${
            isActive ? "bg-black" : "bg-gray-500"
          }`}
        >
          Add
        </button>
      </div>

      {/* Scores */}
      <div>
        <h2 className="text-xl mb-2">Your Scores</h2>

        {scores.map((s) => (
          <div key={s.id} className="border p-2 mb-2 rounded">
            {s.score} —{" "}
            {new Date(s.played_at).toLocaleDateString()}
          </div>
        ))}
      </div>

      {/* Charity */}
      <div>
        <h2 className="text-xl mb-2">Charity</h2>

        <select
          className="border p-2 w-full mb-2"
          onChange={(e) => setSelectedCharity(e.target.value)}
        >
          <option>Select Charity</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={percentage}
          onChange={(e) =>
            setPercentage(parseInt(e.target.value) || 0)
          }
          className="border p-2 w-full mb-2"
        />

        <button
          onClick={saveCharity}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Save
        </button>
      </div>

      {/* Stats */}
      <div className="border p-4 rounded">
        <p>Total Draws: {winners.length}</p>
        <p>
          Total Won: ₹
          {winners.reduce((a, w) => a + (w.payout || 0), 0).toFixed(2)}
        </p>
      </div>

      {/* Donations */}
      <div className="border p-4 rounded">
        <h2 className="text-xl mb-2">Your Impact</h2>

        <p className="text-2xl font-bold">
          ₹
          {donations
            .reduce((a, d) => a + (d.amount || 0), 0)
            .toFixed(2)}
        </p>
      </div>

      {/* Winnings */}
      <div>
        <h2 className="text-xl mb-2">Winnings</h2>

        {winners.map((w) => (
          <div key={w.id} className="border p-3 mb-3 rounded">
            <p>Match: {w.match_count}</p>
            <p>Payout: ₹{w.payout?.toFixed(2)}</p>
            <p>Status: {w.status}</p>

            {!w.proof_url && w.status === "pending" && (
              <input
                type="file"
                onChange={(e) =>
                  e.target.files &&
                  uploadProof(e.target.files[0], w.id)
                }
              />
            )}

            {w.proof_url && (
              <a
                href={w.proof_url}
                target="_blank"
                className="text-blue-500"
              >
                View Proof
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 DRAW HISTORY */}
      <div>
        <h2 className="text-xl font-bold mb-4">Draw History</h2>

        {drawHistory.map((d) => (
          <div key={d.id} className="border p-4 mb-3 rounded">
            <p>{new Date(d.draw_month).toLocaleDateString()}</p>
            <p>Numbers: {d.numbers.join(", ")}</p>

            {d.userWin ? (
              <p className="text-green-500">
                Won ₹{d.userWin.payout} (Match {d.userWin.match_count})
              </p>
            ) : (
              <p className="text-gray-400">No win</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}