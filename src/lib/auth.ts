import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};