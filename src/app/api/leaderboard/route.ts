import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // =========================
    // 🔐 STEP 1: GET TOKEN
    // =========================
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // 🔐 STEP 2: VERIFY USER
    // =========================
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // 🔐 STEP 3: ADMIN CHECK
    // =========================
    const { data: profile, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // =========================
    // 🏆 TOP WINNERS
    // =========================
    const { data: winners } = await adminSupabase
      .from("winners")
      .select("user_id, payout");

    const winnerMap: Record<string, number> = {};

    winners?.forEach((w) => {
      winnerMap[w.user_id] =
        (winnerMap[w.user_id] || 0) + w.payout;
    });

    const topWinners = Object.entries(winnerMap)
      .map(([user_id, total]) => ({ user_id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // =========================
    // 🎯 BEST PLAYERS
    // =========================
    const { data: scores } = await adminSupabase
      .from("scores")
      .select("user_id, score");

    const scoreMap: Record<string, number[]> = {};

    scores?.forEach((s) => {
      if (!scoreMap[s.user_id]) scoreMap[s.user_id] = [];
      scoreMap[s.user_id].push(s.score);
    });

    const bestPlayers = Object.entries(scoreMap)
      .map(([user_id, scores]) => ({
        user_id,
        avg:
          scores.reduce((a, b) => a + b, 0) /
          scores.length,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);

    // =========================
    // ❤️ TOP DONORS
    // =========================
    const { data: donations } = await adminSupabase
      .from("donations")
      .select("user_id, amount");

    const donationMap: Record<string, number> = {};

    donations?.forEach((d) => {
      donationMap[d.user_id] =
        (donationMap[d.user_id] || 0) + d.amount;
    });

    const topDonors = Object.entries(donationMap)
      .map(([user_id, total]) => ({ user_id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // =========================
    // ✅ RESPONSE
    // =========================
    return NextResponse.json({
      topWinners,
      bestPlayers,
      topDonors,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}