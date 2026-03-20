"use client";
import { useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
const router = useRouter();
const searchParams = useSearchParams();

const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  router.push(redirectTo);
};

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Login</h1>

      <input
        className="border p-2 block mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 block mb-2"
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2"
      >
        Login
      </button>
    </div>
  );
}