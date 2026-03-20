import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 IMPORTANT
);

export async function POST() {
  try {
    const monthKey = new Date().toISOString().slice(0, 7);

    // Prevent duplicate draw
    const { data: existingDraw } = await supabase
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

    // Active users
    const { data: subs } = await supabase
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

    // Previous rollover
    const { data: lastDraw } = await supabase
      .from("draws")
      .select("rollover_amount")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const previousRollover = lastDraw?.rollover_amount || 0;

    // Draw numbers
    const drawNumbers = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 45) + 1
    );

    const basePool = userIds.length * 100;

    const match5Pool = basePool * 0.4 + previousRollover;
    const match4Pool = basePool * 0.35;
    const match3Pool = basePool * 0.25;

    // Fetch scores (optimized)
    const { data: scores } = await supabase
      .from("scores")
      .select("user_id, score")
      .in("user_id", userIds);

    const scoreMap: Record<string, number[]> = {};

    scores?.forEach((row) => {
      if (!scoreMap[row.user_id]) scoreMap[row.user_id] = [];
      scoreMap[row.user_id].push(row.score);
    });

    const winnersByTier: any = { 3: [], 4: [], 5: [] };

    for (const userId of userIds) {
      const userScores = scoreMap[userId] || [];

      const matches = userScores.filter((s) =>
        drawNumbers.includes(s)
      ).length;

      if (matches >= 3) {
        winnersByTier[matches].push(userId);
      }
    }

    const hasMatch5 = winnersByTier[5].length > 0;
    const newRollover = hasMatch5 ? 0 : match5Pool;

    // Create draw
    const { data: draw } = await supabase
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

      for (const userId of users) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("charity_id, charity_percentage")
          .eq("id", userId)
          .single();

        const percentage = profile?.charity_percentage || 0;
        const donationAmount = (payout * percentage) / 100;

        const winner = {
          user_id: userId,
          draw_id: draw.id,
          match_count: tier,
          payout,
          status: "pending",
          payment_status: "pending",
        };

        winnerRows.push(winner);

        if (profile?.charity_id && donationAmount > 0) {
          donationRows.push({
            user_id: userId,
            charity_id: profile.charity_id,
            amount: donationAmount,
          });
        }
      }
    }

    // Batch inserts
    if (winnerRows.length) {
      const { data: insertedWinners } = await supabase
        .from("winners")
        .insert(winnerRows)
        .select();

      // Link donations to winners
      insertedWinners?.forEach((w, i) => {
        if (donationRows[i]) {
          donationRows[i].winner_id = w.id;
        }
      });

      if (donationRows.length) {
        await supabase.from("donations").insert(donationRows);
      }
    }

    return NextResponse.json({
      success: true,
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