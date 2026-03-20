"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { useRouter } from "next/navigation";

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}