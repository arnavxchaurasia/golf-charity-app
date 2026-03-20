import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabase } from "@/lib/supabase";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    /* ================= INPUT ================= */
    const { plan } = await req.json();

    if (!["monthly", "yearly"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    /* ================= AMOUNT ================= */
    const amount = plan === "monthly" ? 10000 : 100000;

    /* ================= ORDER ================= */
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}