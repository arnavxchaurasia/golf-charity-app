import { redirect } from "next/navigation";
import Login from "./Login";
import { supabase } from "@/lib/supabase";

export default async function LoginPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ if logged in → redirect
  if (user) {
    redirect("/dashboard");
  }

  return <Login />;
}