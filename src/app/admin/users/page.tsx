"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          created_at,
          charity_id,
          charity_percentage,
          subscriptions (
            status,
            plan,
            end_date
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= TOGGLE ================= */
  const toggleSubscription = async (
    userId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus =
        currentStatus === "active" ? "expired" : "active";

      await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("user_id", userId);

      toast.success(`Subscription ${newStatus}`);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-20 text-center text-muted-foreground">
        Loading users...
      </div>
    );
  }

  return (
    <div className="section space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-semibold">Users</h1>
        <p className="text-muted-foreground">
          Manage users and subscriptions
        </p>
      </div>

      {/* EMPTY */}
      {users.length === 0 && (
        <div className="text-center text-muted-foreground py-20">
          No users found 👀
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {users.map((u) => {
          const sub = u.subscriptions?.[0];

          const isActive =
            sub?.status === "active" &&
            new Date(sub?.end_date) > new Date();

          return (
            <motion.div
              key={u.id}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-border bg-white shadow-sm p-5 space-y-4 transition"
            >

              {/* USER INFO */}
              <div>
                <p className="text-sm text-muted-foreground">
                  User
                </p>
                <p className="font-semibold">
                  {u.id.slice(0, 10)}...
                </p>
              </div>

              {/* JOIN DATE */}
              <div className="text-sm text-muted-foreground">
                Joined:{" "}
                {new Date(u.created_at).toLocaleDateString()}
              </div>

              {/* PLAN */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Plan
                </span>
                <span className="font-medium">
                  {sub?.plan || "None"}
                </span>
              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Status
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* CHARITY */}
              <div className="text-sm text-muted-foreground">
                Charity:{" "}
                {u.charity_id ? "Selected" : "None"}
              </div>

              {/* ACTION */}
              <button
                onClick={() =>
                  toggleSubscription(
                    u.id,
                    sub?.status || "expired"
                  )
                }
                className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition"
              >
                Toggle Subscription
              </button>

            </motion.div>
          );
        })}

      </div>
    </div>
  );
}