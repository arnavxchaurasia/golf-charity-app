import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, score } = await req.json();

    if (!userId || !score) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    if (score < 1 || score > 45) {
      return NextResponse.json(
        { error: "Invalid score" },
        { status: 400 }
      );
    }

    // get existing scores
    const { data: existing } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: true });

    if (existing && existing.length >= 5) {
      await supabase
        .from("scores")
        .delete()
        .eq("id", existing[0].id);
    }

    await supabase.from("scores").insert({
      user_id: userId,
      score,
      played_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}