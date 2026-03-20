import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    /* ------------------ AUTH CHECK ------------------ */

    const token = req.headers
      .get("authorization")
      ?.split("Bearer ")[1];

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    /* ------------------ SUPER ADMIN CHECK ------------------ */

    if (user.email !== "your@email.com") {
      return new Response("Forbidden", { status: 403 });
    }

    /* ------------------ INPUT ------------------ */

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    /* ------------------ FIND USER ------------------ */

    const { data: profile, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (findError || !profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /* ------------------ UPDATE ROLE ------------------ */

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", profile.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update role" },
        { status: 500 }
      );
    }

    /* ------------------ SUCCESS ------------------ */

    return NextResponse.json({
      success: true,
      message: `${email} is now an admin`,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}