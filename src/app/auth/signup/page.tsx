"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    const user = data.user;

    // Create profile
    if (user) {
      await supabase.from("profiles").insert({
        id: user.id,
      });
    }

    alert("Signup successful!");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Signup</h1>

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
        onClick={handleSignup}
        className="bg-black text-white px-4 py-2"
      >
        Sign Up
      </button>
    </div>
  );
}