import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { event_name } = await req.json();

    if (!event_name) {
      return NextResponse.json({ error: "Missing event_name" }, { status: 400 });
    }

    await supabaseAdmin.from("events").insert({
      event_name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}