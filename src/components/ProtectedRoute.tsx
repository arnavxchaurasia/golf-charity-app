"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // 🔥 small delay to allow session hydration
      await new Promise((r) => setTimeout(r, 100));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/auth/login";
        return;
      }

      if (mounted) {
        setAuthorized(true);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking auth...
        </p>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}