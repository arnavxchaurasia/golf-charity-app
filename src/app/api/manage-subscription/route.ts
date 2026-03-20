import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// 🔥 Admin client (bypasses RLS safely)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    /* =========================
       🔐 STEP 1: AUTH HEADER
    ========================= */
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    /* =========================
       🔐 STEP 2: VERIFY USER
    ========================= */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid session" },
        { status: 401 }
      );
    }

    const userId = user.id;

    /* =========================
       📥 STEP 3: INPUT
    ========================= */
    const body = await req.json();
    const { action, plan } = body;

    if (!action || !["cancel", "renew"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    /* =========================
       🔍 STEP 4: GET LATEST SUB (FIXED 🔥)
    ========================= */
    const { data: existing, error: fetchError } =
      await adminSupabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }) // ✅ FIX
        .limit(1) // ✅ FIX
        .maybeSingle();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: 500 }
      );
    }

    /* =========================
       ❌ STEP 5: CANCEL
    ========================= */
    if (action === "cancel") {
      const { error } = await adminSupabase
        .from("subscriptions")
        .update({
          status: "cancelled",
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Cancel error:", error);
        return NextResponse.json(
          { error: "Failed to cancel subscription" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Subscription cancelled",
      });
    }

    /* =========================
       🔄 STEP 6: RENEW
    ========================= */
    if (action === "renew") {
      if (!plan || !["monthly", "yearly"].includes(plan)) {
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        );
      }

      const duration = plan === "monthly" ? 30 : 365;

      let newEndDate = new Date();

      // ✅ extend if active
      if (
        existing &&
        existing.status === "active" &&
        existing.end_date &&
        new Date(existing.end_date) > new Date()
      ) {
        newEndDate = new Date(existing.end_date);
      }

      newEndDate.setDate(newEndDate.getDate() + duration);

      const { error } = await adminSupabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            status: "active",
            plan,
            start_date: new Date().toISOString(),
            end_date: newEndDate.toISOString(),
          },
          {
            onConflict: "user_id", // ✅ prevents duplicates
          }
        );

      if (error) {
        console.error("Renew error:", error);
        return NextResponse.json(
          { error: "Failed to renew subscription" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Subscription renewed",
      });
    }

    /* ========================= */
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (err) {
    console.error("SERVER ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}