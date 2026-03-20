import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
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

    const userId = user.id;

    // =========================
    // 🔐 STEP 3: ADMIN CHECK
    // =========================
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // =========================
    // 🧾 PARSE BODY
    // =========================
    const body = await req.json().catch(() => null);
    const drawType = body?.drawType || "random";

    if (!["random", "weighted"].includes(drawType)) {
      return NextResponse.json(
        { error: "Invalid draw type" },
        { status: 400 }
      );
    }

    const monthKey = new Date().toISOString().slice(0, 7);

    // =========================
    // ❌ PREVENT DUPLICATE DRAW
    // =========================
    const { data: existingDraw } = await adminSupabase
      .from("draws")
      .select("id")
      .eq("month_key", monthKey)
      .maybeSingle();

    if (existingDraw) {
      return NextResponse.json(
        { error: "Draw already exists" },
        { status: 400 }
      );
    }

    // =========================
    // 👥 ACTIVE USERS
    // =========================
    const { data: subs } = await adminSupabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active")
      .gt("end_date", new Date().toISOString());

    const userIds = subs?.map((s) => s.user_id) || [];

    if (!userIds.length) {
      return NextResponse.json(
        { error: "No active users" },
        { status: 400 }
      );
    }

    // =========================
    // 🔁 ROLLOVER
    // =========================
    const { data: lastDraw } = await adminSupabase
      .from("draws")
      .select("rollover_amount")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const previousRollover = lastDraw?.rollover_amount || 0;

    // =========================
    // 🎯 DRAW NUMBERS
    // =========================
    let drawNumbers: number[] = [];

    if (drawType === "weighted") {
      const { data: allScores } = await adminSupabase
        .from("scores")
        .select("score");

      const frequency: Record<number, number> = {};

      allScores?.forEach((row) => {
        frequency[row.score] =
          (frequency[row.score] || 0) + 1;
      });

      const weightedPool: number[] = [];

      Object.entries(frequency).forEach(([num, count]) => {
        for (let i = 0; i < count; i++) {
          weightedPool.push(Number(num));
        }
      });

      while (drawNumbers.length < 5) {
        const pool =
          weightedPool.length > 0
            ? weightedPool
            : Array.from({ length: 45 }, (_, i) => i + 1);

        const pick =
          pool[Math.floor(Math.random() * pool.length)];

        if (!drawNumbers.includes(pick)) {
          drawNumbers.push(pick);
        }
      }
    } else {
      while (drawNumbers.length < 5) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!drawNumbers.includes(num)) drawNumbers.push(num);
      }
    }

    // =========================
    // 💰 POOL
    // =========================
    const basePool = userIds.length * 100;

    const match5Pool = basePool * 0.4 + previousRollover;
    const match4Pool = basePool * 0.35;
    const match3Pool = basePool * 0.25;

    // =========================
    // 📊 SCORES
    // =========================
    const { data: scores } = await adminSupabase
      .from("scores")
      .select("user_id, score")
      .in("user_id", userIds);

    const scoreMap: Record<string, number[]> = {};

    scores?.forEach((row) => {
      if (!scoreMap[row.user_id]) scoreMap[row.user_id] = [];
      scoreMap[row.user_id].push(row.score);
    });

    const winnersByTier: any = { 3: [], 4: [], 5: [] };

    for (const uid of userIds) {
      const userScores = scoreMap[uid] || [];

      const matches = userScores.filter((s) =>
        drawNumbers.includes(s)
      ).length;

      if (matches >= 3) {
        winnersByTier[matches].push(uid);
      }
    }

    const hasMatch5 = winnersByTier[5].length > 0;
    const newRollover = hasMatch5 ? 0 : match5Pool;

    // =========================
    // 🧾 CREATE DRAW
    // =========================
    const { data: draw, error: drawError } =
      await adminSupabase
        .from("draws")
        .insert({
          draw_month: new Date().toISOString(),
          month_key: monthKey,
          numbers: drawNumbers,
          rollover_amount: newRollover,
          status: "published",
        })
        .select()
        .single();

    if (drawError || !draw) {
      return NextResponse.json(
        { error: "Draw creation failed" },
        { status: 500 }
      );
    }

    // =========================
    // 🏆 WINNERS + DONATIONS
    // =========================
    const winnerRows: any[] = [];
    const donationRows: any[] = [];

    for (const tier of [5, 4, 3]) {
      const users = winnersByTier[tier];
      if (!users.length) continue;
      if (tier === 5 && !hasMatch5) continue;

      const pool =
        tier === 5
          ? match5Pool
          : tier === 4
          ? match4Pool
          : match3Pool;

      const payout = pool / users.length;

      for (const uid of users) {
        const { data: profile } = await adminSupabase
          .from("profiles")
          .select("charity_id, charity_percentage")
          .eq("id", uid)
          .single();

        const percentage = profile?.charity_percentage || 0;
        const donationAmount = (payout * percentage) / 100;

        winnerRows.push({
          user_id: uid,
          draw_id: draw.id,
          match_count: tier,
          payout,
          status: "pending",
          payment_status: "pending",
        });

        if (profile?.charity_id && donationAmount > 0) {
          donationRows.push({
            user_id: uid,
            charity_id: profile.charity_id,
            amount: donationAmount,
          });
        }
      }
    }

    if (winnerRows.length) {
      const { data: insertedWinners } =
        await adminSupabase
          .from("winners")
          .insert(winnerRows)
          .select();

      insertedWinners?.forEach((w, i) => {
        if (donationRows[i]) {
          donationRows[i].winner_id = w.id;
        }
      });

      if (donationRows.length) {
        await adminSupabase.from("donations").insert(donationRows);
      }
    }

    return NextResponse.json({
      success: true,
      drawType,
      drawNumbers,
      rollover: newRollover,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}