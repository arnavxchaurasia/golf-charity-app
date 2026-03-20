"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);

  // 🔥 Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      // 🔥 Create order (backend)
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          plan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Order failed");
        setLoading(false);
        return;
      }

      // 🔥 Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,

        name: "Golf Charity Platform",
        description:
          plan === "monthly"
            ? "Monthly Subscription"
            : "Yearly Subscription",

        handler: async function (response: any) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...response,
              userId: user.id,
              plan,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            alert("Payment verification failed");
            return;
          }

          alert("Subscription activated!");
          window.location.href = "/dashboard";
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-5xl w-full">

        <h1 className="text-4xl font-bold text-center mb-12">
          Choose Your Plan
        </h1>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Monthly */}
          <div className="border border-gray-300 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-900 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Monthly Plan
            </h2>

            <p className="text-4xl font-bold mb-6">
              ₹100<span className="text-sm">/month</span>
            </p>

            <ul className="text-gray-500 mb-6 space-y-2">
              <li>✔ Participate in monthly draws</li>
              <li>✔ Track golf scores</li>
              <li>✔ Support charities</li>
            </ul>

            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loading}
              className="w-full bg-blue-600 py-3 rounded-xl hover:bg-blue-700 transition text-white"
            >
              {loading ? "Processing..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* Yearly */}
          <div className="border border-gray-300 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-900 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Yearly Plan
            </h2>

            <p className="text-4xl font-bold mb-2">
              ₹1000<span className="text-sm">/year</span>
            </p>

            <p className="text-green-500 mb-4">
              Save 17%
            </p>

            <ul className="text-gray-500 mb-6 space-y-2">
              <li>✔ Everything in monthly</li>
              <li>✔ Better savings</li>
              <li>✔ Priority participation</li>
            </ul>

            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={loading}
              className="w-full bg-purple-600 py-3 rounded-xl hover:bg-purple-700 transition text-white"
            >
              {loading ? "Processing..." : "Subscribe Yearly"}
            </button>
          </div>

        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          Secure payments powered by Razorpay. A portion goes to charity.
        </p>

      </div>
    </div>
  );
}