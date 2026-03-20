import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    // 📥 STEP 3: GET INPUT
    // =========================
    const { score } = await req.json();

    if (!score) {
      return NextResponse.json(
        { error: "Missing score" },
        { status: 400 }
      );
    }

    if (score < 1 || score > 45) {
      return NextResponse.json(
        { error: "Invalid score" },
        { status: 400 }
      );
    }

    // =========================
    // 📊 STEP 4: GET EXISTING
    // =========================
    const { data: existing, error: fetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: true });

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // =========================
    // 🔁 STEP 5: KEEP MAX 5
    // =========================
    if (existing && existing.length >= 5) {
      await supabase
        .from("scores")
        .delete()
        .eq("id", existing[0].id);
    }

    // =========================
    // ➕ STEP 6: INSERT SCORE
    // =========================
    const { error: insertError } = await supabase
      .from("scores")
      .insert({
        user_id: userId,
        score,
        played_at: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // =========================
    // ✅ SUCCESS
    // =========================
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}