"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCharities = async () => {
    const { data } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    setCharities(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  if (loading) {
    return <div className="p-10">Loading charities...</div>;
  }

  return (
    <div className="min-h-screen px-6 py-16 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Support Meaningful Causes
        </h1>

        <p className="text-gray-500 max-w-2xl mx-auto">
          A portion of your subscription goes directly to charities you care about.
          Choose where your impact goes.
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8">
        {charities.map((c) => (
          <div
            key={c.id}
            className="border border-gray-300 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition"
          >
            {/* Image (optional future field) */}
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-400">Charity Image</span>
            </div>

            <h2 className="text-xl font-semibold">{c.name}</h2>

            <p className="text-gray-500 mt-2 text-sm">
              {c.description || "No description available"}
            </p>

            {/* Impact */}
            <div className="mt-4 text-sm text-gray-400">
              💖 Donations received: ₹{c.total_donations || 0}
            </div>

            {/* CTA */}
            <a
              href="/dashboard"
              className="block mt-6 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Support this Charity
            </a>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {charities.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No charities available yet.
        </div>
      )}
    </div>
  );
}