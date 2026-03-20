"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SubscribePage() {
  const [loadingPlan, setLoadingPlan] = useState<
    "monthly" | "yearly" | null
  >(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setLoadingPlan(plan);

    try {
      /* ================= AUTH ================= */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        toast.error("Please login first");
        return;
      }

      /* ================= CREATE ORDER ================= */
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // ✅ FIXED
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      /* ================= RAZORPAY ================= */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,

        name: "BirdieFund",
        description:
          plan === "monthly"
            ? "Monthly Membership"
            : "Yearly Membership",

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(
              "/api/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`, // 🔥 IMPORTANT FIX
                },
                body: JSON.stringify({
                  ...response,
                  plan,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error);
            }

            toast.success("Subscription activated 🎉");

            window.location.href = "/dashboard";
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },

        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Payment failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-24 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-semibold tracking-tight">
          Choose your plan
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Play better. Win bigger. Give more.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-10">

        {/* MONTHLY */}
        <motion.div
          whileHover={{ y: -8 }}
          className="rounded-3xl border border-border bg-white shadow-lg overflow-hidden transition"
        >
          <img
            src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1200&auto=format&fit=crop"
            className="h-44 w-full object-cover"
          />

          <div className="p-8">
            <h2 className="text-2xl font-semibold">
              Monthly
            </h2>

            <p className="text-4xl font-bold mt-4">
              ₹100
              <span className="text-sm text-muted-foreground ml-1">
                /month
              </span>
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>✔ Monthly prize draws</li>
              <li>✔ Track your golf scores</li>
              <li>✔ Support real charities</li>
            </ul>

            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loadingPlan === "monthly"}
              className="w-full mt-8 py-3 rounded-xl bg-slate-900 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loadingPlan === "monthly"
                ? "Processing..."
                : "Start Monthly"}
            </button>
          </div>
        </motion.div>

        {/* YEARLY (FEATURED) */}
        <motion.div
          whileHover={{ y: -10 }}
          className="rounded-3xl border border-border bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-2xl overflow-hidden relative"
        >
          {/* Badge */}
          <div className="absolute top-4 right-4 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
            Best Value
          </div>

          <img
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop"
            className="h-44 w-full object-cover"
          />

          <div className="p-8">
            <h2 className="text-2xl font-semibold">
              Yearly
            </h2>

            <p className="text-4xl font-bold mt-4">
              ₹1000
              <span className="text-sm text-muted-foreground ml-1">
                /year
              </span>
            </p>

            <p className="text-green-600 text-sm mt-2">
              Save 17%
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>✔ Everything in monthly</li>
              <li>✔ Priority draws</li>
              <li>✔ Best value plan</li>
            </ul>

            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={loadingPlan === "yearly"}
              className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loadingPlan === "yearly"
                ? "Processing..."
                : "Go Yearly"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <p className="text-center text-sm text-muted-foreground mt-16">
        Secure payments powered by Razorpay. A portion goes to charity.
      </p>
    </div>
  );
}