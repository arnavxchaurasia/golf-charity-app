import { supabase } from "./supabase";

export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Role fetch error:", error);
    return null;
  }

  return data?.role || null;
};