import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await supabase
        .from("winners")
        .update({ status: "approved" })
        .eq("id", id);
    }

    if (action === "paid") {
      await supabase
        .from("winners")
        .update({ payment_status: "paid" })
        .eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}