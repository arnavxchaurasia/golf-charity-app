import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
  }

  const duration = plan === "monthly" ? 30 : 365;

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    status: "active",
    plan,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + duration * 86400000).toISOString(),
  });

  return NextResponse.json({ success: true });
}