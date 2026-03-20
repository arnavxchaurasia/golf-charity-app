"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const init = async () => {
      // 🔥 get session once (correct way)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setStatus("authorized");
      } else {
        setStatus("unauthorized");
      }
    };

    init();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking auth...
        </p>
      </div>
    );
  }

  /* ---------------- REDIRECT ---------------- */
  if (status === "unauthorized") {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return null;
  }

  /* ---------------- AUTHORIZED ---------------- */
  return <>{children}</>;
}