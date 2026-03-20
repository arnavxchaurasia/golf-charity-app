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
    const { data: profile, error: roleError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    if (roleError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // =========================
    // 🧾 STEP 4: INPUT
    // =========================
    const { id, action, note } = await req.json();

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (!["approve", "reject", "paid"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    let updateData: any = {};

    // =========================
    // 🎯 ACTION HANDLING
    // =========================
    if (action === "approve") {
      updateData.status = "approved";
    }

    if (action === "paid") {
      updateData.payment_status = "paid";
    }

    if (action === "reject") {
      updateData.status = "rejected";
      updateData.rejected = true;
    }

    if (note) {
      updateData.admin_note = note;
    }

    // =========================
    // 🔍 CHECK WINNER EXISTS
    // =========================
    const { data: winner } = await adminSupabase
      .from("winners")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!winner) {
      return NextResponse.json(
        { error: "Winner not found" },
        { status: 404 }
      );
    }

    // =========================
    // 🛠 UPDATE
    // =========================
    const { error } = await adminSupabase
      .from("winners")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}