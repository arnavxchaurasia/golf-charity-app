"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { motion } from "framer-motion";

const fallbackImages = [
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1200",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200",
  "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?q=80&w=1200",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200",
];

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
    return (
      <div className="p-20 text-center text-muted-foreground">
        Loading charities...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-20 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-semibold tracking-tight">
          Make Every Round Matter
        </h1>

        <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-lg">
          Your game does more than win prizes — it creates real impact.
          Choose where your contribution goes.
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {charities.map((c, i) => {
          const image =
            c.image_url ||
            fallbackImages[i % fallbackImages.length];

          return (
            <motion.div
              key={c.id}
              whileHover={{ y: -8 }}
              className="group rounded-3xl overflow-hidden border border-border bg-white shadow-sm transition"
            >

              {/* IMAGE */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-lg font-semibold">
                    {c.name}
                  </h2>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-3">

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {c.description ||
                    "Helping communities and creating meaningful impact."}
                </p>

                {/* IMPACT */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Donations
                  </span>
                  <span className="font-medium text-foreground">
                    ₹{c.total_donations || 0}
                  </span>
                </div>

                {/* CTA */}
                <a
                  href="/dashboard"
                  className="block mt-4 text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:opacity-90 transition"
                >
                  Support this cause
                </a>
              </div>

            </motion.div>
          );
        })}

      </div>

      {/* EMPTY */}
      {charities.length === 0 && (
        <div className="text-center text-muted-foreground mt-20">
          No charities yet — check back soon 🌱
        </div>
      )}
    </div>
  );
}