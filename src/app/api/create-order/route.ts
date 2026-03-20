import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { plan, userId } = await req.json();

  const amount = plan === "monthly" ? 10000 : 100000; // paise

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `receipt_${userId}`,
  });

  return NextResponse.json({
    orderId: order.id,
    amount,
  });
}