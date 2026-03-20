"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const { data: listener } =
      supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth changed:", event, session);
      });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}