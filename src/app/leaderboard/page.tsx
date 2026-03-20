"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any>({});

  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        /* 🔥 FIXED USER FETCH */
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !user) {
          toast.error("Please login first");
          router.push("/auth/login");
          return;
        }

        setUserId(user.id);

        const res = await fetch("/api/leaderboard", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) throw new Error();

        const json = await res.json();
        setData(json);

        /* 🔥 FETCH PROFILE NAMES */
        const ids = [
          ...json.topWinners.map((u: any) => u.user_id),
          ...json.bestPlayers.map((u: any) => u.user_id),
          ...json.topDonors.map((u: any) => u.user_id),
        ];

        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", ids);

        const map: any = {};
        profileData?.forEach((p) => {
          map[p.id] = p.username || "Player";
        });

        setProfiles(map);

      } catch {
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [router]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!data) return null;

  return (
    <div className="section space-y-14">

      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-5xl font-semibold">
          Leaderboard 🏆
        </h1>
        <p className="text-muted-foreground mt-2">
          Every stroke counts. Every win matters.
        </p>
      </div>

      {/* PODIUM */}
      <Podium users={data.topWinners.slice(0, 3)} profiles={profiles} />

      {/* SECTIONS */}
      <Section title="Top Winners">
        {data.topWinners.map((u: any, i: number) => (
          <Row
            key={i}
            rank={i}
            name={profiles[u.user_id]}
            value={`₹${u.total}`}
            highlight={u.user_id === userId}
          />
        ))}
      </Section>

      <Section title="Best Players">
        {data.bestPlayers.map((u: any, i: number) => (
          <Row
            key={i}
            rank={i}
            name={profiles[u.user_id]}
            value={u.avg.toFixed(2)}
            highlight={u.user_id === userId}
          />
        ))}
      </Section>

      <Section title="Top Donors">
        {data.topDonors.map((u: any, i: number) => (
          <Row
            key={i}
            rank={i}
            name={profiles[u.user_id]}
            value={`₹${u.total}`}
            highlight={u.user_id === userId}
          />
        ))}
      </Section>
    </div>
  );
}

/* ---------------- PODIUM ---------------- */

function Podium({ users, profiles }: any) {
  const order = [1, 0, 2];

  return (
    <div className="flex justify-center items-end gap-6">
      {order.map((pos, i) => {
        const u = users[pos];
        if (!u) return null;

        return (
          <motion.div
            key={i}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`w-28 ${
              pos === 0
                ? "h-40 bg-yellow-400"
                : pos === 1
                ? "h-56 bg-gray-300"
                : "h-32 bg-amber-500"
            } rounded-t-2xl flex flex-col items-center justify-end pb-4 text-black font-bold shadow-xl`}
          >
            <div>#{pos + 1}</div>
            <div className="text-xs">{profiles[u.user_id]}</div>
            <div className="text-xs">₹{u.total}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- SECTION ---------------- */

function Section({ title, children }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/* ---------------- ROW ---------------- */

function Row({ rank, name, value, highlight }: any) {
  const initials = name?.charAt(0)?.toUpperCase() || "?";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center justify-between p-4 rounded-xl transition
        ${
          highlight
            ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
            : "bg-white dark:bg-gray-900 border border-border"
        }`}
    >
      <div className="flex items-center gap-4">

        <div className="w-8 font-bold">#{rank + 1}</div>

        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
          {initials}
        </div>

        <div className="font-medium">
          {name || "Player"}
        </div>

        {highlight && (
          <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
            YOU
          </span>
        )}
      </div>

      <div className="font-semibold">{value}</div>
    </motion.div>
  );
}