"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getUserRole } from "@/lib/role";

/* ------------------ UI COMPONENTS ------------------ */

function Card({ children }: any) {
  return <div className="card p-6">{children}</div>;
}

function Stat({ label, value }: any) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">₹{value}</p>
    </div>
  );
}

function Badge({ label }: any) {
  const color =
    label === "approved" || label === "paid"
      ? "text-green-600"
      : label === "rejected"
      ? "text-red-500"
      : "text-yellow-500";

  return <span className={`text-sm font-medium ${color}`}>{label}</span>;
}

/* ------------------ PAGE ------------------ */

export default function Admin() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [winners, setWinners] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [drawType, setDrawType] = useState<"random" | "weighted">("random");

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [email, setEmail] = useState(""); // 🔥 promote admin

  /* ------------------ AUTH + ROLE CHECK ------------------ */

  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const role = await getUserRole(user.id);

    if (role !== "admin") {
      toast.error("Unauthorized");
      window.location.href = "/";
      return;
    }

    setAuthorized(true);
  };

  /* ------------------ FETCH ------------------ */

  const fetchAll = async () => {
    const [winnersRes, analyticsRes] = await Promise.all([
      supabase
        .from("winners")
        .select("*")
        .order("created_at", { ascending: false }),

      Promise.all([
        supabase.from("total_revenue").select("*").single(),
        supabase.from("total_donations").select("*").single(),
        supabase.from("total_payouts").select("*").single(),
        supabase.from("active_users").select("*").single(),
      ]),
    ]);

    setWinners(winnersRes.data || []);

    const [rev, don, pay, active] = analyticsRes;

    setAnalytics({
      revenue: rev.data?.revenue || 0,
      donations: don.data?.donations || 0,
      payouts: pay.data?.payouts || 0,
      users: active.data?.active || 0,
    });

    setLoading(false);
  };

  useEffect(() => {
    checkAdmin().then(fetchAll);
  }, []);

  /* ------------------ ACTIONS ------------------ */

  const runDraw = async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch("/api/run-draw", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ drawType }),
      });

      toast.success("Draw completed");
      fetchAll();
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "paid"
  ) => {
    setActionLoading(id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch("/api/winner-action", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          id,
          action,
          note: notes[id],
        }),
      });

      toast.success("Updated");
      fetchAll();
    } catch {
      toast.error("Failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* ------------------ PROMOTE ADMIN ------------------ */

  const promoteUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();

      toast.success("User promoted to admin");
      setEmail("");
    } catch {
      toast.error("Failed to promote");
    }
  };

  /* ------------------ STATES ------------------ */

  if (!authorized) {
    return (
      <div className="p-20 text-center text-muted-foreground">
        Checking access...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-20 text-center text-muted-foreground">
        Loading admin panel...
      </div>
    );
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="section space-y-10">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-semibold">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage platform operations and users
        </p>
      </motion.div>

      {/* ANALYTICS */}
      <div className="grid md:grid-cols-4 gap-5">
        <Stat label="Revenue" value={analytics.revenue} />
        <Stat label="Donations" value={analytics.donations} />
        <Stat label="Payouts" value={analytics.payouts} />
        <Stat label="Users" value={analytics.users} />
      </div>

      {/* PROMOTE USER */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Promote User to Admin</h2>

        <div className="flex gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="px-4 py-2 border border-border rounded-xl w-full"
          />

          <button onClick={promoteUser} className="btn-primary">
            Promote
          </button>
        </div>
      </Card>

      {/* DRAW CONTROL */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Run Draw</h2>

        <div className="flex gap-4">
          <select
            value={drawType}
            onChange={(e) =>
              setDrawType(e.target.value as any)
            }
            className="px-4 py-2 border border-border rounded-xl"
          >
            <option value="random">Random</option>
            <option value="weighted">Weighted</option>
          </select>

          <button onClick={runDraw} className="btn-primary">
            Run Draw
          </button>
        </div>
      </Card>

      {/* WINNERS */}
      <Card>
        <h2 className="text-xl font-semibold mb-6">Winners</h2>

        {winners.length === 0 ? (
          <p className="text-muted-foreground">No winners yet</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {winners.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl border border-border bg-muted/30 space-y-2"
              >
                <p className="font-medium">₹{w.payout}</p>
                <p className="text-sm">Match: {w.match_count}</p>

                <div className="flex gap-3">
                  <Badge label={w.status} />
                  <Badge label={w.payment_status} />
                </div>

                <input
                  placeholder="Admin note"
                  value={notes[w.id] || ""}
                  onChange={(e) =>
                    setNotes({
                      ...notes,
                      [w.id]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAction(w.id, "approve")}
                    className="px-3 py-1 rounded-lg bg-green-500 text-white"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleAction(w.id, "reject")}
                    className="px-3 py-1 rounded-lg bg-yellow-500 text-white"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => handleAction(w.id, "paid")}
                    className="px-3 py-1 rounded-lg bg-blue-500 text-white"
                  >
                    Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}