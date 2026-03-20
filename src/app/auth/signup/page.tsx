import { redirect } from "next/navigation";
import Signup from "./Signup";
import { supabase } from "@/lib/supabase";

export default async function SignupPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <Signup />;
}