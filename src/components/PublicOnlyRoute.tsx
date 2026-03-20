"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();
import { useRouter } from "next/navigation";

export default function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) return <div className="p-10">Loading...</div>;

  return <>{children}</>;
}