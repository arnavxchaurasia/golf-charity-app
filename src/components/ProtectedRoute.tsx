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
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // 🔥 use hard redirect (avoids Next.js state issues)
        window.location.href = "/auth/login";
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Checking auth...
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}