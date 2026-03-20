import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    /* ================= AUTH ================= */
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    /* ================= INPUT ================= */
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing payment data" },
        { status: 400 }
      );
    }

    if (!["monthly", "yearly"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    /* ================= SIGNATURE VERIFY ================= */
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    /* ================= REPLAY PROTECTION ================= */
    const { data: existingPayment } = await adminSupabase
      .from("payments")
      .select("id")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment already processed" },
        { status: 400 }
      );
    }

    /* ================= SAVE PAYMENT ================= */
    await adminSupabase.from("payments").insert({
      user_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      plan,
    });

    /* ================= UPDATE SUB ================= */
    const duration = plan === "monthly" ? 30 : 365;

    const { data: existingSub } = await adminSupabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let newEndDate = new Date();

    if (
      existingSub &&
      existingSub.status === "active" &&
      existingSub.end_date &&
      new Date(existingSub.end_date) > new Date()
    ) {
      newEndDate = new Date(existingSub.end_date);
    }

    newEndDate.setDate(newEndDate.getDate() + duration);

    await adminSupabase.from("subscriptions").upsert({
      user_id: userId,
      status: "active",
      plan,
      start_date: new Date().toISOString(),
      end_date: newEndDate.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified",
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}